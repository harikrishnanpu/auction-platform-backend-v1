import { IGetFallBackAuctionWinnerStrategy } from '@application/interfaces/strategies/auction/getFallBackWinner.stratgy';
import { ICreatePendingPaymentForAuctionUsecase } from '@application/interfaces/usecases/payments/ICreatePendingPaymentForUsecase';
import { IEventBus } from '@application/interfaces/events/IEventBus';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import {
    IProcessAuctionWinnerFallbackInput,
    IProcessAuctionWinnerFallbackUsecase,
} from '@application/interfaces/usecases/auction/IProcessWinnerFallbackUsecase';
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

@injectable()
export class ProcessAuctionWinnerFallbackUsecase implements IProcessAuctionWinnerFallbackUsecase {
    constructor(
        @inject(TYPES.IAuctionRepository)
        private readonly _auctionRepository: IAuctionRepository,
        @inject(TYPES.IPaymentRepository)
        private readonly _paymentRepository: IPaymentRepository,
        @inject(TYPES.ICreatePendingPaymentForAuctionUsecase)
        private readonly _createPendingPaymentForAuctionUsecase: ICreatePendingPaymentForAuctionUsecase,
        @inject(TYPES.INotificationRepository)
        private readonly _notificationRepository: INotificationRepository,
        @inject(TYPES.IEventBus)
        private readonly _eventBus: IEventBus,
        @inject(TYPES.IIdGeneratingService)
        private readonly _idGeneratingService: IIdGeneratingService,
        @inject(TYPES.IGetFallBackAuctionWinnerStrategy)
        private readonly _getFallBackAuctionWinnerStrategy: IGetFallBackAuctionWinnerStrategy,
    ) {}

    async execute(
        input: IProcessAuctionWinnerFallbackInput,
    ): Promise<Result<void>> {
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

        const cleanupResult =
            await this._paymentRepository.declineAllPendingForAuctionUser(
                input.auctionId,
                input.declinedUserId,
            );

        if (cleanupResult.isFailure) {
            return Result.fail(cleanupResult.getError());
        }

        const fallbackResult =
            await this._getFallBackAuctionWinnerStrategy.execute({
                auctionId: input.auctionId,
                declinedUserId: input.declinedUserId,
            });

        if (fallbackResult.isFailure) {
            return Result.fail(fallbackResult.getError());
        }

        const next = fallbackResult.getValue();

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
            winnerId: next.winnerId,
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

        if (!next.winnerId) {
            return Result.ok();
        }

        const pendingPaymentsResult =
            await this._createPendingPaymentForAuctionUsecase.execute({
                userId: next.winnerId,
                auctionId: input.auctionId,
                winAmount: next.winningAmount ?? 0,
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
            userId: next.winnerId,
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

        const notify = savedWinner.getValue();
        this._eventBus.publish(
            new NotificationCreated(
                notify.getId(),
                notify.getUserId(),
                notify.getTitle(),
                notify.getMessage(),
            ),
        );

        return Result.ok();
    }
}
