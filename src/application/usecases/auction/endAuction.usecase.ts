import { AUCTION_MESSAGES } from '@application/constants/auction/auction.constants';
import {
    IEndAuctionInput,
    IEndAuctionOutput,
} from '@application/dtos/auction/end-auction.dto';
import { IEventBus } from '@application/interfaces/events/IEventBus';
import { IEndAuctionUsecase } from '@application/interfaces/usecases/auction/IEndAuctionUsecase';
import { TYPES } from '@di/types.di';
import {
    Auction,
    AuctionStatus,
} from '@domain/entities/auction/auction.entity';
import { AuctionEnded } from '@domain/events/auction-end.event';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';
import { AuctionWinnerStrategyFactory } from '@application/factories/auction-winner-policy.factory';

@injectable()
export class EndAuctionUsecase implements IEndAuctionUsecase {
    constructor(
        @inject(TYPES.IAuctionRepository)
        private readonly _auctionRepository: IAuctionRepository,
        @inject(TYPES.IEventBus)
        private readonly _eventBus: IEventBus,
        @inject(TYPES.AuctionWinnerStrategyFactory)
        private readonly _auctionWinnerStrategyFactory: AuctionWinnerStrategyFactory,
    ) {}

    async execute(input: IEndAuctionInput): Promise<Result<IEndAuctionOutput>> {
        const existing = await this._auctionRepository.findById(
            input.auctionId,
        );

        if (existing.isFailure) return Result.fail(existing.getError());

        const auction = existing.getValue();
        const isAdmin = input.isAdmin ?? false;

        if (!isAdmin && auction.getSellerId() !== input.userId) {
            return Result.fail(AUCTION_MESSAGES.NOT_AUTHORIZED_TO_END);
        }

        if (
            auction.getStatus() !== AuctionStatus.ACTIVE &&
            auction.getStatus() !== AuctionStatus.PAUSED
        ) {
            return Result.fail(AUCTION_MESSAGES.ONLY_ACTIVE_CAN_BE_ENDED);
        }

        const getWinnerStrategy =
            this._auctionWinnerStrategyFactory.getStrategy(
                auction.getAuctionType(),
            );
        const winnerResult = await getWinnerStrategy.validateAndGetWinner({
            auction,
        });
        if (winnerResult.isFailure) return Result.fail(winnerResult.getError());

        const { winnerId, winAmount } = winnerResult.getValue();

        const endedResult = Auction.create({
            id: auction.getId(),
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
            winnerId,
            winAmount,
            assets: auction.getAssets(),
        });

        if (endedResult.isFailure) return Result.fail(endedResult.getError());
        const ended = endedResult.getValue();

        const updateResult = await this._auctionRepository.save(ended);
        if (updateResult.isFailure) return Result.fail(updateResult.getError());

        const saved = updateResult.getValue();

        this._eventBus.publish(
            new AuctionEnded(
                saved.getId(),
                saved.getTitle(),
                winnerId,
                winAmount,
                new Date(),
            ),
        );

        return Result.ok({
            id: saved.getId(),
            status: saved.getStatus(),
        });
    }
}
