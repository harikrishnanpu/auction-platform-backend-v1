import { AuctionWinnerStrategyFactory } from '@application/factories/auction-winner-policy.factory';
import { IEventBus } from '@application/interfaces/events/IEventBus';
import type { ILogger } from '@application/interfaces/services/ILogger';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { ISystemConfigService } from '@application/interfaces/services/ISystemConfigService';
import {
    IExpireOverdueAuctionsOutput,
    IExpireOverdueAuctionsUsecase,
} from '@application/interfaces/usecases/auction/IExpireOverdueAuctionsUsecase';
import { TYPES } from '@di/types.di';
import {
    Auction,
    AuctionStatus,
} from '@domain/entities/auction/auction.entity';
import {
    AuctionWinner,
    AuctionWinnerStatus,
} from '@domain/entities/auction/auction-winner.entity';
import { AuctionEnded } from '@domain/events/auction-end.event';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { IAuctionWinnerRepository } from '@domain/repositories/IAuctionWinnerRepo';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class ExpireOverdueAuctionsUsecase implements IExpireOverdueAuctionsUsecase {
    constructor(
        @inject(TYPES.IAuctionRepository)
        private readonly _auctionRepository: IAuctionRepository,
        @inject(TYPES.IEventBus)
        private readonly _eventBus: IEventBus,
        @inject(TYPES.AuctionWinnerStrategyFactory)
        private readonly _auctionWinnerStrategyFactory: AuctionWinnerStrategyFactory,
        @inject(TYPES.IAuctionWinnerRepository)
        private readonly _auctionWinnerRepository: IAuctionWinnerRepository,
        @inject(TYPES.IIdGeneratingService)
        private readonly _idGeneratingService: IIdGeneratingService,
        @inject(TYPES.ILogger)
        private readonly _logger: ILogger,
        @inject(TYPES.ISystemConfigService)
        private readonly _systemConfigService: ISystemConfigService,
    ) {}

    async execute(): Promise<Result<IExpireOverdueAuctionsOutput>> {
        const batchSizeResult =
            await this._systemConfigService.getAuctionExpiryBatchSize();
        if (batchSizeResult.isFailure) {
            return Result.fail(batchSizeResult.getError());
        }

        const overdueResult =
            await this._auctionRepository.findOverdueActiveAuctions(
                batchSizeResult.getValue(),
                new Date(),
            );

        if (overdueResult.isFailure) {
            return Result.fail(overdueResult.getError());
        }

        const overdue = overdueResult.getValue();
        let ended = 0;
        let failed = 0;

        for (const auction of overdue) {
            const endResult = await this.endOverdueAuction(auction);
            if (endResult.isFailure) {
                failed += 1;
                continue;
            }

            ended += 1;
        }

        this._logger.info('Auction expiry cron executed');

        return Result.ok({
            processed: overdue.length,
            ended,
            failed,
        });
    }

    private async endOverdueAuction(auction: Auction): Promise<Result<void>> {
        if (
            auction.getStatus() !== AuctionStatus.ACTIVE &&
            auction.getStatus() !== AuctionStatus.PAUSED
        ) {
            return Result.ok();
        }

        const winnerStrategy = this._auctionWinnerStrategyFactory.getStrategy(
            auction.getAuctionType(),
        );
        const winnerResult = await winnerStrategy.validateAndGetWinner({
            auction,
        });

        if (winnerResult.isFailure) {
            return Result.fail(winnerResult.getError());
        }

        const { winnerId, winAmount } = winnerResult.getValue();

        if (winnerId) {
            const auctionWinnerEntity = AuctionWinner.create({
                id: this._idGeneratingService.generateId(),
                auctionId: auction.getId(),
                userId: winnerId,
                amount: winAmount,
                rank: 1,
                status: AuctionWinnerStatus.PENDING,
            });

            if (auctionWinnerEntity.isFailure) {
                return Result.fail(auctionWinnerEntity.getError());
            }

            const saveWinnerResult = await this._auctionWinnerRepository.save(
                auctionWinnerEntity.getValue(),
            );
            if (saveWinnerResult.isFailure) {
                return Result.fail(saveWinnerResult.getError());
            }
        }

        const endedResult = Auction.create({
            id: auction.getId(),
            auctionNumber: auction.getAuctionNumber(),
            sellerId: auction.getSellerId(),
            auctionType: auction.getAuctionType(),
            title: auction.getTitle(),
            description: auction.getDescription(),
            category: auction.getCategory(),
            condition: auction.getCondition(),
            startPrice: auction.getStartPrice(),
            minIncrement: auction.getMinIncrement(),
            startAt: auction.getStartAt(),
            endAt: auction.getEndAt(),
            status: AuctionStatus.ENDED,
            antiSnipSeconds: auction.getAntiSnipSeconds(),
            extensionCount: auction.getExtensionCount(),
            maxExtensionCount: auction.getMaxExtensionCount(),
            bidCooldownSeconds: auction.getBidCooldownSeconds(),
            winnerId: winnerId ?? null,
            winAmount: winnerId ? winAmount : null,
            assets: auction.getAssets(),
        });

        if (endedResult.isFailure) {
            return Result.fail(endedResult.getError());
        }

        const updateResult = await this._auctionRepository.save(
            endedResult.getValue(),
        );
        if (updateResult.isFailure) {
            return Result.fail(updateResult.getError());
        }

        const saved = updateResult.getValue();

        this._eventBus.publish(
            new AuctionEnded(
                saved.getId(),
                saved.getTitle(),
                winnerId,
                winAmount ?? 0,
                saved.getEndAt(),
            ),
        );

        return Result.ok();
    }
}
