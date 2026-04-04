import {
    IDeclinePublicFallbackAuctionInputDto,
    IDeclinePublicFallbackAuctionOutputDto,
} from '@application/dtos/auction/declinePublicFallbackAuction.dto';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { IDeclinePublicFallbackAuctionUsecase } from '@application/interfaces/usecases/auction/IDeclinePublicFallbackAuctionUsecase';
import { TYPES } from '@di/types.di';
import { AuctionStatus } from '@domain/entities/auction/auction.entity';
import {
    PublicAuctionFallbackParticipants,
    PublicAuctionFallbackParticipantsPaymentStatus,
    PublicAuctionFallbackParticipantsStatus,
} from '@domain/entities/auction/public-auction-fallback-participants.entity';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { IFallbackAuctionParticipantsRepo } from '@domain/repositories/IFallbackAuctionParticipantsRepo';
import { Result } from '@domain/shared/result';
import { inject } from 'inversify';

export class DeclinePublicFallbackAuctionUsecase implements IDeclinePublicFallbackAuctionUsecase {
    constructor(
        @inject(TYPES.IAuctionRepository)
        private readonly _auctionRepository: IAuctionRepository,
        @inject(TYPES.IIdGeneratingService)
        private readonly _idGeneratingService: IIdGeneratingService,
        @inject(TYPES.IFallbackAuctionParticipantsRepo)
        private readonly _publicFallbackAuctionParticipantsRepo: IFallbackAuctionParticipantsRepo,
    ) {}

    async execute(
        input: IDeclinePublicFallbackAuctionInputDto,
    ): Promise<Result<IDeclinePublicFallbackAuctionOutputDto>> {
        const auctionResult = await this._auctionRepository.findById(
            input.auctionId,
        );

        if (auctionResult.isFailure)
            return Result.fail(auctionResult.getError());

        const auction = auctionResult.getValue();

        if (!auction) return Result.fail('Auction not found');

        if (auction.getStatus() !== AuctionStatus.FALLBACK_PUBLIC_NOTIFICATION)
            return Result.fail('Auction is not in public notification status');

        const auctionPublicParticipantEntity =
            PublicAuctionFallbackParticipants.create({
                id: this._idGeneratingService.generateId(),
                publicFallbackAuctionId: auction.getId(),
                userId: input.userId,
                status: PublicAuctionFallbackParticipantsStatus.REJECTED,
                paymentStatus:
                    PublicAuctionFallbackParticipantsPaymentStatus.PENDING,
            });

        if (auctionPublicParticipantEntity.isFailure)
            return Result.fail(auctionPublicParticipantEntity.getError());
        const auctionPublicParticipant =
            auctionPublicParticipantEntity.getValue();

        await this._publicFallbackAuctionParticipantsRepo.save(
            auctionPublicParticipant,
        );

        return Result.ok({ success: true });
    }
}
