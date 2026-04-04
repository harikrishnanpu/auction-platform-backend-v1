import { IEventBus } from '@application/interfaces/events/IEventBus';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { IProcessFallbackPublicNotificationUsecase } from '@application/interfaces/usecases/auction/IProcessFallbackPublicNotificationUsecase';
import { TYPES } from '@di/types.di';
import { AuctionStatus } from '@domain/entities/auction/auction.entity';
import {
    AuctionPublicFallbackPaymentStatus,
    AuctionPublicFallbackStatus,
    PublicFallbackAuction,
} from '@domain/entities/auction/public-fallback-auction.entity';
import { Notification } from '@domain/entities/notifications/notification.entity';
import { NotificationCreated } from '@domain/events/notitificationCreated.event';
import { IAuctionParticipantRepository } from '@domain/repositories/IAuctionParticipantRepository';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { IFallbackAuctionRepo } from '@domain/repositories/IFallbackAuctionRepo';
import { INotificationRepository } from '@domain/repositories/INotificationRepo';
import { Result } from '@domain/shared/result';
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
        @inject(TYPES.IFallbackAuctionRepository)
        private readonly _publicFallbackAuctionRepository: IFallbackAuctionRepo,
    ) {}

    async execute(auctionId: string): Promise<Result<void>> {
        console.log('START -- PROCESS FALLBACK PUBLIC NOTIFICATION');

        try {
            const auctionEntity =
                await this._auctionRepository.findById(auctionId);

            if (auctionEntity.isFailure) {
                throw new Error(auctionEntity.getError());
            }

            const auction = auctionEntity.getValue();

            if (auction.getStatus() !== AuctionStatus.FALLBACK_ENDED) {
                throw new Error('Auction is not ended');
            }

            const setStatusResult = auction.setStatus(
                AuctionStatus.FALLBACK_PUBLIC_NOTIFICATION,
            );
            if (setStatusResult.isFailure) {
                return Result.fail(setStatusResult.getError());
            }

            const newFallbackAuction = PublicFallbackAuction.create({
                id: this._idGeneratingService.generateId(),
                auctionId: auctionId,
                amount: auction.getStartPrice(),
                status: AuctionPublicFallbackStatus.PENDING,
                paymentStatus: AuctionPublicFallbackPaymentStatus.PENDING,
            });

            if (newFallbackAuction.isFailure) {
                return Result.fail(newFallbackAuction.getError());
            }

            await this._publicFallbackAuctionRepository.save(
                newFallbackAuction.getValue(),
            );

            const savedAuction = await this._auctionRepository.save(auction);

            if (savedAuction.isFailure) {
                return Result.fail(savedAuction.getError());
            }

            const participantsResult =
                await this._participantRepository.findByAuctionId(auctionId);

            if (participantsResult.isFailure) {
                return Result.fail(participantsResult.getError());
            }

            const participants = participantsResult.getValue();

            for (const participant of participants) {
                const notificationEntity = Notification.create({
                    id: this._idGeneratingService.generateId(),
                    title: `You got another chance to win the auction: ${auction.getTitle()}`,
                    message: `Checkout the auction room to win the auction within 30 mins: ${auction.getTitle()}`,
                    userId: participant.getUserId(),
                });

                if (notificationEntity.isFailure) {
                    return Result.fail(notificationEntity.getError());
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

            return Result.ok();
        } catch (error) {
            console.log(error);
            return Result.fail(
                'UNEXPECTED ERROR FROM PROCESS FALLBACK PUBLIC NOTIFICATION USECASE',
            );
        }
    }
}
