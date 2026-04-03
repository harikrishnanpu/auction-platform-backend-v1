import {
    IVerifyPublicFallbackAuctionPaymentInputDto,
    IVerifyPublicFallbackAuctionPaymentOutputDto,
} from '@application/dtos/payments/verify-public-fallback-auction-payment.dto';
import { IVerifyFallbackPublicAuctionPaymentUsecase } from '@application/interfaces/usecases/payments/IVerifyFallbackPublicAuctionPaymentUsecase';
import { TYPES } from '@di/types.di';
import { AuctionStatus } from '@domain/entities/auction/auction.entity';
import { PublicAuctionFallbackParticipantsPaymentStatus } from '@domain/entities/auction/public-auction-fallback-participants.entity';
import { AuctionPublicFallbackPaymentStatus } from '@domain/entities/auction/public-fallback-auction.entity';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { IFallbackAuctionParticipantsRepo } from '@domain/repositories/IFallbackAuctionParticipantsRepo';
import { IFallbackAuctionRepo } from '@domain/repositories/IFallbackAuctionRepo';
import { IPaymentRepository } from '@domain/repositories/IPaymentRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class VerifyPublicAuctionPaymentUsecase implements IVerifyFallbackPublicAuctionPaymentUsecase {
    constructor(
        @inject(TYPES.IPaymentRepository)
        private readonly _paymentRepository: IPaymentRepository,
        @inject(TYPES.IFallbackAuctionParticipantsRepo)
        private readonly _fallbackAuctionParticipantsRepo: IFallbackAuctionParticipantsRepo,
        @inject(TYPES.IFallbackAuctionRepository)
        private readonly _publicFallbackAuctionRepository: IFallbackAuctionRepo,
        @inject(TYPES.IAuctionRepository)
        private readonly _auctionRepository: IAuctionRepository,
    ) {}

    async execute(
        input: IVerifyPublicFallbackAuctionPaymentInputDto,
    ): Promise<Result<IVerifyPublicFallbackAuctionPaymentOutputDto>> {
        const fallbackAuctionResult =
            await this._publicFallbackAuctionRepository.findByAuctionId(
                input.auctionId,
            );
        const fallbackAuctionPaymentParticipant =
            await this._fallbackAuctionParticipantsRepo.findByAuctionIdAndUserId(
                input.auctionId,
                input.userId,
            );

        const auctionResult = await this._auctionRepository.findById(
            input.auctionId,
        );
        if (auctionResult.isFailure)
            return Result.fail(auctionResult.getError());

        if (fallbackAuctionResult.isFailure)
            return Result.fail(fallbackAuctionResult.getError());
        if (fallbackAuctionPaymentParticipant.isFailure)
            return Result.fail(fallbackAuctionPaymentParticipant.getError());

        const fallbackAuction = fallbackAuctionResult.getValue();
        const fallbackAuctionPaymentParticipantEntity =
            fallbackAuctionPaymentParticipant.getValue();
        const auction = auctionResult.getValue();

        if (!auction) return Result.fail('Auction not found');
        if (!fallbackAuction) return Result.fail('Fallback auction not found');
        if (!fallbackAuctionPaymentParticipantEntity)
            return Result.fail(
                'Fallback auction payment participant not found',
            );

        if (
            fallbackAuction.getPaymentStatus() !==
            AuctionPublicFallbackPaymentStatus.PENDING
        )
            return Result.fail('Fallback auction not pending payment');

        const setPaymentStatusResult =
            fallbackAuctionPaymentParticipantEntity.setPaymentStatus(
                PublicAuctionFallbackParticipantsPaymentStatus.PAID,
            );
        if (setPaymentStatusResult.isFailure)
            return Result.fail(setPaymentStatusResult.getError());
        await this._fallbackAuctionParticipantsRepo.save(
            fallbackAuctionPaymentParticipantEntity,
        );

        const setFallbackAuctionPaymentStatusResult =
            fallbackAuction.setPaymentStatus(
                AuctionPublicFallbackPaymentStatus.PAID,
            );
        if (setFallbackAuctionPaymentStatusResult.isFailure)
            return Result.fail(setPaymentStatusResult.getError());
        await this._publicFallbackAuctionRepository.save(fallbackAuction);

        const setAuctionPaymentStatusResult = auction.setStatus(
            AuctionStatus.SOLD,
        );
        if (setAuctionPaymentStatusResult.isFailure)
            return Result.fail(setAuctionPaymentStatusResult.getError());
        await this._auctionRepository.save(auction);

        return Result.ok({ success: true });
    }
}
