import { ICreatePendingPaymentForAuctionUsecase } from '@application/interfaces/usecases/payments/ICreatePendingPaymentForUsecase';
import {
    IProcessWinnerFallbackInput,
    IProcessWinnerFallbackUsecase,
} from '@application/interfaces/usecases/payments/IProcessWinnerFallbackUsecase';
import { IAuctionBidLeaderboardService } from '@application/interfaces/services/IAuctionBidLeaderboardService';
import { IEventBus } from '@application/interfaces/events/IEventBus';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { TYPES } from '@di/types.di';
import {
    Auction,
    AuctionStatus,
} from '@domain/entities/auction/auction.entity';
import { Notification } from '@domain/entities/notifications/notification.entity';
import { NotificationCreated } from '@domain/events/notitificationCreated.event';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { INotificationRepository } from '@domain/repositories/INotificationRepo';
import { IPaymentRepository } from '@domain/repositories/IPaymentRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

/** 0-based: only ranks 0, 1, 2 (top 3 unique bidders) can receive the winner slot. */
const MAX_WINNER_RANK_INDEX = 2;

@injectable()
export class ProcessWinnerFallbackUsecase implements IProcessWinnerFallbackUsecase {
    constructor(
        @inject(TYPES.IAuctionRepository)
        private readonly _auctionRepository: IAuctionRepository,
        @inject(TYPES.IPaymentRepository)
        private readonly _paymentRepository: IPaymentRepository,
        @inject(TYPES.IAuctionBidLeaderboardService)
        private readonly _leaderboardService: IAuctionBidLeaderboardService,
        @inject(TYPES.ICreatePendingPaymentForAuctionUsecase)
        private readonly _createPendingPaymentForAuctionUsecase: ICreatePendingPaymentForAuctionUsecase,
        @inject(TYPES.INotificationRepository)
        private readonly _notificationRepository: INotificationRepository,
        @inject(TYPES.IEventBus)
        private readonly _eventBus: IEventBus,
        @inject(TYPES.IIdGeneratingService)
        private readonly _idGeneratingService: IIdGeneratingService,
    ) {}

    async execute(input: IProcessWinnerFallbackInput): Promise<Result<void>> {
        const auctionResult = await this._auctionRepository.findById(
            input.auctionId,
        );
        if (auctionResult.isFailure) {
            return Result.fail(auctionResult.getError());
        }

        const auction = auctionResult.getValue();
        const status = auction.getStatus();
        if (status !== AuctionStatus.ENDED && status !== AuctionStatus.SOLD) {
            return Result.ok();
        }

        if (auction.getWinnerId() !== input.declinedUserId) {
            return Result.ok();
        }

        const leaderboardResult =
            await this._leaderboardService.getRankedUniqueBidders(
                input.auctionId,
            );
        if (leaderboardResult.isFailure) {
            return Result.fail(leaderboardResult.getError());
        }

        const leaderboard = leaderboardResult.getValue();
        const declinedIndex = leaderboard.findIndex(
            (e) => e.userId === input.declinedUserId,
        );
        if (declinedIndex === -1) {
            return Result.ok();
        }
        if (declinedIndex >= MAX_WINNER_RANK_INDEX) {
            return Result.ok();
        }
        if (declinedIndex + 1 >= leaderboard.length) {
            return Result.ok();
        }

        const next = leaderboard[declinedIndex + 1];
        if (!next || next.winningAmount <= 0) {
            return Result.ok();
        }

        const cleanupResult =
            await this._paymentRepository.declineAllPendingForAuctionUser(
                input.auctionId,
                input.declinedUserId,
            );
        if (cleanupResult.isFailure) {
            return Result.fail(cleanupResult.getError());
        }

        const updatedAuctionResult = Auction.create({
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
            status: auction.getStatus(),
            antiSnipSeconds: auction.getAntiSnipSeconds(),
            extensionCount: auction.getExtensionCount(),
            maxExtensionCount: auction.getMaxExtensionCount(),
            bidCooldownSeconds: auction.getBidCooldownSeconds(),
            winnerId: next.userId,
            winAmount: next.winningAmount,
            assets: auction.getAssets(),
        });
        if (updatedAuctionResult.isFailure) {
            return Result.fail(updatedAuctionResult.getError());
        }

        const saveResult = await this._auctionRepository.save(
            updatedAuctionResult.getValue(),
        );
        if (saveResult.isFailure) {
            return Result.fail(saveResult.getError());
        }

        const pendingPaymentsResult =
            await this._createPendingPaymentForAuctionUsecase.execute({
                userId: next.userId,
                auctionId: input.auctionId,
                winAmount: next.winningAmount,
                endedAt: auction.getEndAt(),
            });
        if (pendingPaymentsResult.isFailure) {
            return Result.fail(pendingPaymentsResult.getError());
        }

        const title = `You won the auction: ${auction.getTitle()}`;
        const winnerNotification = Notification.create({
            id: this._idGeneratingService.generateId(),
            title,
            message: title,
            userId: next.userId,
        });
        if (winnerNotification.isFailure) {
            return Result.fail(winnerNotification.getError());
        }

        const savedWinner = await this._notificationRepository.save(
            winnerNotification.getValue(),
        );
        if (savedWinner.isFailure) {
            return Result.fail(savedWinner.getError());
        }

        const w = savedWinner.getValue();
        this._eventBus.publish(
            new NotificationCreated(
                w.getId(),
                w.getUserId(),
                w.getTitle(),
                w.getMessage(),
            ),
        );

        return Result.ok();
    }
}
