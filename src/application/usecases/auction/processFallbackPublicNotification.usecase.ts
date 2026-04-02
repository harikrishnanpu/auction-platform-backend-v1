import { IEventBus } from '@application/interfaces/events/IEventBus';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { IProcessFallbackPublicNotificationUsecase } from '@application/interfaces/usecases/auction/IProcessFallbackPublicNotificationUsecase';
import { TYPES } from '@di/types.di';
import { AuctionStatus } from '@domain/entities/auction/auction.entity';
import { Notification } from '@domain/entities/notifications/notification.entity';
// import { PaymentFor, PaymentPhase, Payments, PaymentStatus } from "@domain/entities/payments/payments.entity";
import { NotificationCreated } from '@domain/events/notitificationCreated.event';
import { IAuctionParticipantRepository } from '@domain/repositories/IAuctionParticipantRepository';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { INotificationRepository } from '@domain/repositories/INotificationRepo';
import { inject, injectable } from 'inversify';

@injectable()
export class ProcessFallbackPublicNotificationUsecase implements IProcessFallbackPublicNotificationUsecase {
    constructor(
        @inject(TYPES.IAuctionRepository)
        private readonly _auctionRepository: IAuctionRepository,
        @inject(TYPES.IAuctionParticipantRepository)
        private readonly _participantRepository: IAuctionParticipantRepository,
        @inject(TYPES.IIdGeneratingService)
        private readonly _idGeneratingService: IIdGeneratingService,
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

        if (auction.getStatus() !== AuctionStatus.FALLBACK_ENDED) {
            throw new Error('Auction is not ended');
        }

        const participantsResult =
            await this._participantRepository.findByAuctionId(auctionId);

        if (participantsResult.isFailure) {
            throw new Error(participantsResult.getError());
        }

        const participants = participantsResult.getValue();

        for (const participant of participants) {
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

            // const paymentsEntity = Payments.create({
            //     id: this._idGeneratingService.generateId(),
            //     userId: participant.getUserId(),
            //     amount: auction.getWinAmount() ?? 0,
            //     currency: 'INR',
            //     status: PaymentStatus.PENDING,
            //     forPayment: PaymentFor.AUCTION,
            //     referenceId: this._idGeneratingService.generateId(),
            //     phase: PaymentPhase.DEPOSIT,
            //     dueAt: new Date(),
            // });

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
