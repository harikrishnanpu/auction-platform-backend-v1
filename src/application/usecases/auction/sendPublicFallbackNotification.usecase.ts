import { IEventBus } from '@application/interfaces/events/IEventBus';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { ISendPublicFallbackPublicNotificationUsecase } from '@application/interfaces/usecases/auction/ISendPublicFallbackPublicNotificationUsecase';
import { TYPES } from '@di/types.di';
import { AuctionStatus } from '@domain/entities/auction/auction.entity';
import { Notification } from '@domain/entities/notifications/notification.entity';
import { NotificationCreated } from '@domain/events/notitificationCreated.event';
import { IAuctionParticipantRepository } from '@domain/repositories/IAuctionParticipantRepository';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { IAuctionWinnerRepository } from '@domain/repositories/IAuctionWinnerRepo';
import { INotificationRepository } from '@domain/repositories/INotificationRepo';
import { inject } from 'inversify';

export class SendPublicFallbackNotificationUsecase implements ISendPublicFallbackPublicNotificationUsecase {
    constructor(
        @inject(TYPES.IAuctionRepository)
        private readonly _auctionRepository: IAuctionRepository,
        @inject(TYPES.IAuctionParticipantRepository)
        private readonly _auctionParticipantRepository: IAuctionParticipantRepository,
        @inject(TYPES.IIdGeneratingService)
        private readonly _idGeneratingService: IIdGeneratingService,
        @inject(TYPES.IAuctionWinnerRepository)
        private readonly _auctionWinnerRepository: IAuctionWinnerRepository,
        @inject(TYPES.INotificationRepository)
        private readonly _notificationRepository: INotificationRepository,
        @inject(TYPES.IEventBus)
        private readonly _eventBus: IEventBus,
    ) {}

    async execute(auctionId: string): Promise<void> {
        const auctionEntity = await this._auctionRepository.findById(auctionId);

        if (auctionEntity.isFailure) {
            throw new Error(auctionEntity.getError());
        }

        const auction = auctionEntity.getValue();

        if (auction.getStatus() !== AuctionStatus.ENDED) {
            throw new Error('Auction is not ended');
        }

        const participantsResult =
            await this._auctionParticipantRepository.findByAuctionId(auctionId);
        const auctionWinnersResult =
            await this._auctionWinnerRepository.findAllByAuctionId(auctionId);

        if (participantsResult.isFailure || auctionWinnersResult.isFailure) {
            throw new Error(
                participantsResult.getError() ||
                    auctionWinnersResult.getError(),
            );
        }

        const participants = participantsResult.getValue();
        const auctionWinners = auctionWinnersResult.getValue();

        const eligibleParticipants = participants.filter(
            (participant) =>
                !auctionWinners.some(
                    (winner) => winner.getUserId() === participant.getUserId(),
                ),
        );

        for (const participant of eligibleParticipants) {
            const notificationEntity = Notification.create({
                id: this._idGeneratingService.generateId(),
                title: `You got another chance to win the auction: ${auction.getTitle()}`,
                message: `Checkout the payments section to win the auction within 30 mins: ${auction.getTitle()}`,
                userId: participant.getUserId(),
            });

            if (notificationEntity.isFailure) {
                throw new Error(notificationEntity.getError());
            }

            await this._notificationRepository.save(
                notificationEntity.getValue(),
            );

            this._eventBus.publish(
                new NotificationCreated(
                    notificationEntity.getValue().getId(),
                    notificationEntity.getValue().getUserId(),
                    notificationEntity.getValue().getTitle(),
                    notificationEntity.getValue().getMessage(),
                ),
            );
        }
    }
}
