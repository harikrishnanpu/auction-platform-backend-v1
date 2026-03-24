import { AUCTION_MESSAGES } from '@application/constants/auction/auction.constants';
import {
    IEndAuctionInput,
    IEndAuctionOutput,
} from '@application/dtos/auction/end-auction.dto';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { IEndAuctionUsecase } from '@application/interfaces/usecases/auction/IEndAuctionUsecase';
import { TYPES } from '@di/types.di';
import {
    Auction,
    AuctionStatus,
} from '@domain/entities/auction/auction.entity';
import { Notification } from '@domain/entities/notifications/notification.entity';
import { IAuctionParticipantRepository } from '@domain/repositories/IAuctionParticipantRepository';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { IBidRepository } from '@domain/repositories/IBidRepository';
import { INotificationRepository } from '@domain/repositories/INotificationRepo';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class EndAuctionUsecase implements IEndAuctionUsecase {
    constructor(
        @inject(TYPES.IAuctionRepository)
        private readonly _auctionRepository: IAuctionRepository,
        @inject(TYPES.IBidRepository)
        private readonly _bidRepository: IBidRepository,
        @inject(TYPES.INotificationRepository)
        private readonly _notificationRepository: INotificationRepository,
        @inject(TYPES.IIdGeneratingService)
        private readonly _idGeneratingService: IIdGeneratingService,
        @inject(TYPES.IAuctionParticipantRepository)
        private readonly _participantRepository: IAuctionParticipantRepository,
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

        const latestBidResult = await this._bidRepository.findLatestByAuctionId(
            input.auctionId,
        );

        if (latestBidResult.isFailure)
            return Result.fail(latestBidResult.getError());

        const latestBid = latestBidResult.getValue();
        const winnerId = latestBid ? latestBid.getUserId() : null;

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
            assets: auction.getAssets(),
        });

        if (endedResult.isFailure) return Result.fail(endedResult.getError());
        const ended = endedResult.getValue();

        const updateResult = await this._auctionRepository.save(ended);
        if (updateResult.isFailure) return Result.fail(updateResult.getError());

        const allParticipantsResult =
            await this._participantRepository.findByAuctionId(input.auctionId);

        if (allParticipantsResult.isFailure)
            return Result.fail(allParticipantsResult.getError());

        if (winnerId) {
            const winnerNotificationResult =
                await this.createNotificationForUser({
                    userId: winnerId,
                    title: 'Auction result',
                    message: `You won the auction: ${auction.getTitle()}`,
                });
            if (winnerNotificationResult.isFailure) {
                return Result.fail(winnerNotificationResult.getError());
            }
        }

        // domain event --changing to--
        for (const participant of allParticipantsResult.getValue()) {
            if (participant.getUserId() === winnerId) continue;

            const loserNotificationResult =
                await this.createNotificationForUser({
                    userId: participant.getUserId(),
                    title: 'Auction result',
                    message: `You lost the auction: ${auction.getTitle()}`,
                });

            if (loserNotificationResult.isFailure) {
                return Result.fail(loserNotificationResult.getError());
            }
        }

        const saved = updateResult.getValue();
        return Result.ok({
            id: saved.getId(),
            status: saved.getStatus(),
        });
    }

    // test for notification
    private async createNotificationForUser({
        userId,
        title,
        message,
    }: {
        userId: string;
        title: string;
        message: string;
    }): Promise<Result<void>> {
        const notification = Notification.create({
            id: this._idGeneratingService.generateId(),
            title,
            message,
            userId,
        });

        if (notification.isFailure) return Result.fail(notification.getError());

        const savedNotification = await this._notificationRepository.save(
            notification.getValue(),
        );
        if (savedNotification.isFailure)
            return Result.fail(savedNotification.getError());

        return Result.ok();
    }
}
