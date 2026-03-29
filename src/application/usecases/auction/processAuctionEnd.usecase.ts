import { IEventBus } from '@application/interfaces/events/IEventBus';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import {
    IProcessAuctionEndInput,
    IProcessAuctionEndNotificationUsecase,
} from '@application/interfaces/usecases/auction/IProcessAuctionEndUsecase';
import { ICreatePendingAuctionInstallmentsUsecase } from '@application/interfaces/usecases/payments/ICreatePendingAuctionInstallmentsUsecase';
import { TYPES } from '@di/types.di';
import { Notification } from '@domain/entities/notifications/notification.entity';
import { NotificationCreated } from '@domain/events/notitificationCreated.event';
import { IAuctionParticipantRepository } from '@domain/repositories/IAuctionParticipantRepository';
import { INotificationRepository } from '@domain/repositories/INotificationRepo';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class ProcessAuctionEndNotificationUsecase implements IProcessAuctionEndNotificationUsecase {
    constructor(
        @inject(TYPES.IEventBus)
        private readonly _eventBus: IEventBus,
        @inject(TYPES.IIdGeneratingService)
        private readonly _idGeneratingService: IIdGeneratingService,
        @inject(TYPES.IAuctionParticipantRepository)
        private readonly _participantRepository: IAuctionParticipantRepository,
        @inject(TYPES.INotificationRepository)
        private readonly _notificationRepository: INotificationRepository,
        @inject(TYPES.ICreatePendingAuctionInstallmentsUsecase)
        private readonly _createPendingAuctionInstallmentsUsecase: ICreatePendingAuctionInstallmentsUsecase,
    ) {}

    async execute(input: IProcessAuctionEndInput): Promise<Result<void>> {
        const participantsResult =
            await this._participantRepository.findByAuctionId(input.auctionId);

        if (participantsResult.isFailure) {
            return Result.fail(participantsResult.getError());
        }

        const participants = participantsResult.getValue();

        if (participants.length === 0) {
            return Result.ok();
        }

        if (!input.winnerId) {
            return Result.ok();
        }

        const winnerNotification = Notification.create({
            id: this._idGeneratingService.generateId(),
            title: `You won the auction: ${input.auctionTitle}`,
            message: `You won the auction: ${input.auctionTitle}`,
            userId: input.winnerId!,
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

        const winner = savedWinner.getValue();

        this._eventBus.publish(
            new NotificationCreated(
                winner.getId(),
                winner.getUserId(),
                winner.getTitle(),
                winner.getMessage(),
            ),
        );

        for (const participant of participants) {
            if (input.winnerId && participant.getUserId() === input.winnerId) {
                continue;
            }

            const notification = Notification.create({
                id: this._idGeneratingService.generateId(),
                title: `You lost the auction: ${input.auctionTitle}`,
                message: `You lost the auction: ${input.auctionTitle}`,
                userId: participant.getUserId(),
            });

            if (notification.isFailure) {
                return Result.fail(notification.getError());
            }

            const saved = await this._notificationRepository.save(
                notification.getValue(),
            );
            if (saved.isFailure) {
                return Result.fail(saved.getError());
            }

            const notify = saved.getValue();

            this._eventBus.publish(
                new NotificationCreated(
                    notify.getId(),
                    notify.getUserId(),
                    notify.getTitle(),
                    notify.getMessage(),
                ),
            );
        }

        return Result.ok();
    }
}
