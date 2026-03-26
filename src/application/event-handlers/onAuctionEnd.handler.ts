import { IEventBus } from '@application/interfaces/events/IEventBus';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { TYPES } from '@di/types.di';
import { Notification } from '@domain/entities/notifications/notification.entity';
import { AuctionEnded } from '@domain/events/auction-end.event';
import { NotificationCreated } from '@domain/events/notitificationCreated.event';
import { IAuctionParticipantRepository } from '@domain/repositories/IAuctionParticipantRepository';
import { INotificationRepository } from '@domain/repositories/INotificationRepo';
import { inject, injectable } from 'inversify';

@injectable()
export class OnAuctionEndHandler {
    constructor(
        @inject(TYPES.IEventBus)
        private readonly _eventBus: IEventBus,
        @inject(TYPES.IIdGeneratingService)
        private readonly _idGeneratingService: IIdGeneratingService,
        @inject(TYPES.IAuctionParticipantRepository)
        private readonly _participantRepository: IAuctionParticipantRepository,
        @inject(TYPES.INotificationRepository)
        private readonly _notificationRepository: INotificationRepository,
    ) {}

    async handle(event: AuctionEnded): Promise<void> {
        console.log('OnAuctionEndHandler', event);

        try {
            console.log(`Auction ended: ${event.auctionId}`);

            const allParticipants =
                await this._participantRepository.findByAuctionId(
                    event.auctionId,
                );

            if (allParticipants.isFailure) {
                console.error(allParticipants.getError());
                return;
            }

            if (event.winnerId) {
                try {
                    const winnerNotificaton = Notification.create({
                        id: this._idGeneratingService.generateId(),
                        title: `You won the auction: ${event.auctionTitle}`,
                        message: `You won the auction: ${event.auctionTitle}`,
                        userId: event.winnerId,
                    });

                    if (winnerNotificaton.isFailure) {
                        console.log(winnerNotificaton.getError());
                    }

                    const winnerNotificationResult =
                        await this._notificationRepository.save(
                            winnerNotificaton.getValue(),
                        );

                    if (winnerNotificationResult.isFailure) {
                        console.log(winnerNotificationResult.getError());
                    }

                    const winnerNotificationCreated = new NotificationCreated(
                        winnerNotificationResult.getValue().getId(),
                        winnerNotificationResult.getValue().getUserId(),
                        winnerNotificationResult.getValue().getTitle(),
                        winnerNotificationResult.getValue().getMessage(),
                    );

                    this._eventBus.publish(winnerNotificationCreated);
                } catch (error) {
                    console.log('error', error);
                }
            }

            for (const participant of allParticipants.getValue()) {
                try {
                    if (participant.getUserId() === event.winnerId) continue;

                    const notification = Notification.create({
                        id: this._idGeneratingService.generateId(),
                        title: `You lost the auction: ${event.auctionTitle}`,
                        message: `You lost the auction: ${event.auctionTitle}`,
                        userId: participant.getUserId(),
                    });

                    if (notification.isFailure) {
                        console.log(notification.getError());
                        continue;
                    }

                    const notificationResult =
                        await this._notificationRepository.save(
                            notification.getValue(),
                        );

                    const notificationCreated = new NotificationCreated(
                        notificationResult.getValue().getId(),
                        notificationResult.getValue().getUserId(),
                        notificationResult.getValue().getTitle(),
                        notificationResult.getValue().getMessage(),
                    );

                    this._eventBus.publish(notificationCreated);
                } catch (error) {
                    console.log('error', error);
                }
            }
        } catch (error) {
            console.log('error', error);
        }
    }
}
