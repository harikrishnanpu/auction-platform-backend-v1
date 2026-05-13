import {
    ICreatePaymentOrderForPublicFallbackAuctionInputDto,
    ICreatePaymentOrderForPublicFallbackAuctionOutputDto,
} from '@application/dtos/payments/create-payment-order-for-public-fallback-auction.dto';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { IPaymentGatewayService } from '@application/interfaces/services/IPaymentGatewayService';
import { ISystemConfigService } from '@application/interfaces/services/ISystemConfigService';
import { ICreatePaymentOrderForPublicFallbackAuctionUsecase } from '@application/interfaces/usecases/payments/ICreatePaymentOrderForPublicFallbackAuctionUsecase';
import { TYPES } from '@di/types.di';
import { AuctionStatus } from '@domain/entities/auction/auction.entity';
import {
    PublicAuctionFallbackParticipants,
    PublicAuctionFallbackParticipantsPaymentStatus,
    PublicAuctionFallbackParticipantsStatus,
} from '@domain/entities/auction/public-auction-fallback-participants.entity';
import {
    AuctionPublicFallbackPaymentStatus,
    AuctionPublicFallbackStatus,
} from '@domain/entities/auction/public-fallback-auction.entity';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { IAuctionWinnerRepository } from '@domain/repositories/IAuctionWinnerRepo';
import { IFallbackAuctionParticipantsRepo } from '@domain/repositories/IFallbackAuctionParticipantsRepo';
import { IFallbackAuctionRepo } from '@domain/repositories/IFallbackAuctionRepo';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class CreatePaymentOrderForPublicFallbackAuctionUsecase implements ICreatePaymentOrderForPublicFallbackAuctionUsecase {
    constructor(
        @inject(TYPES.IFallbackAuctionParticipantsRepo)
        private readonly _fallbackAuctionParticipantsRepo: IFallbackAuctionParticipantsRepo,
        @inject(TYPES.IFallbackAuctionRepository)
        private readonly _publicFallbackAuctionRepository: IFallbackAuctionRepo,
        @inject(TYPES.IPaymentGatewayService)
        private readonly _paymentGatewayService: IPaymentGatewayService,
        @inject(TYPES.IIdGeneratingService)
        private readonly _idGeneratingService: IIdGeneratingService,
        @inject(TYPES.IAuctionRepository)
        private readonly _auctionRepository: IAuctionRepository,
        @inject(TYPES.IAuctionWinnerRepository)
        private readonly _auctionWinnerRepository: IAuctionWinnerRepository,
        @inject(TYPES.ISystemConfigService)
        private readonly _systemConfigService: ISystemConfigService,
    ) {}

    async execute(
        input: ICreatePaymentOrderForPublicFallbackAuctionInputDto,
    ): Promise<Result<ICreatePaymentOrderForPublicFallbackAuctionOutputDto>> {
        const auctionEntoty = await this._auctionRepository.findById(
            input.auctionId,
        );
        if (auctionEntoty.isFailure)
            return Result.fail(auctionEntoty.getError());

        const auction = auctionEntoty.getValue();

        if (!auction) return Result.fail('Auction not found');

        if (auction.getStatus() !== AuctionStatus.FALLBACK_PUBLIC_NOTIFICATION)
            return Result.fail('Auction not public notification');

        const auctionWinnersResult =
            await this._auctionWinnerRepository.findAllByAuctionId(
                input.auctionId,
            );

        if (auctionWinnersResult.isFailure)
            return Result.fail(auctionWinnersResult.getError());

        const auctionWinners = auctionWinnersResult.getValue();
        if (!auctionWinners) return Result.fail('Auction winners not found');

        if (
            auctionWinners.some((winner) => winner.getUserId() === input.userId)
        )
            return Result.fail('You cannot pay for auction in public fallback');

        const fallabckAuctionResult =
            await this._publicFallbackAuctionRepository.findByAuctionId(
                input.auctionId,
            );
        if (fallabckAuctionResult.isFailure)
            return Result.fail(fallabckAuctionResult.getError());

        const fallbackAuction = fallabckAuctionResult.getValue();
        if (!fallbackAuction) return Result.fail('Fallback auction not found');

        if (fallbackAuction.getStatus() !== AuctionPublicFallbackStatus.PENDING)
            return Result.fail('Fallback auction not pending');
        if (
            fallbackAuction.getPaymentStatus() !==
            AuctionPublicFallbackPaymentStatus.PENDING
        )
            return Result.fail('Fallback auction not pending payment');

        const fallbackAuctionUser =
            await this._fallbackAuctionParticipantsRepo.findByAuctionIdAndUserId(
                input.auctionId,
                input.userId,
            );

        if (fallbackAuctionUser.isFailure)
            return Result.fail(fallbackAuctionUser.getError());
        const fallbackAuctionUserEntity = fallbackAuctionUser.getValue();

        if (fallbackAuctionUserEntity) {
            if (
                fallbackAuctionUserEntity.getStatus() ===
                PublicAuctionFallbackParticipantsStatus.REJECTED
            )
                return Result.fail('Fallback auction user is rejected');

            if (
                fallbackAuctionUserEntity.getPaymentStatus() !==
                PublicAuctionFallbackParticipantsPaymentStatus.PENDING
            )
                return Result.fail('Fallback auction user not pending payment');

            const initialSplitResult =
                await this._systemConfigService.getAuctionPublicFallbackInitialSplitRatio();
            if (initialSplitResult.isFailure) {
                return Result.fail(initialSplitResult.getError());
            }

            const paymentOrder = await this._paymentGatewayService.createOrder({
                userId: input.userId,
                amount:
                    fallbackAuction.getAmount() * initialSplitResult.getValue(),
                referenceId: fallbackAuction.getAuctionId(),
            });

            if (paymentOrder.isFailure)
                return Result.fail(paymentOrder.getError());
            const order = paymentOrder.getValue();

            return Result.ok({
                orderId: order.orderId,
                paymentId: order.orderId,
                amountInPaise: order.amountInPaise,
                currency: order.currency,
                gatewayKey: order.gatewayKey,
            });
        }

        const newFallbackAuctionUser = PublicAuctionFallbackParticipants.create(
            {
                id: this._idGeneratingService.generateId(),
                publicFallbackAuctionId: fallbackAuction.getAuctionId(),
                userId: input.userId,
                status: PublicAuctionFallbackParticipantsStatus.PENDING,
                paymentStatus:
                    PublicAuctionFallbackParticipantsPaymentStatus.PENDING,
            },
        );

        if (newFallbackAuctionUser.isFailure)
            return Result.fail(newFallbackAuctionUser.getError());
        const newFallbackAuctionUserEntity = newFallbackAuctionUser.getValue();

        await this._fallbackAuctionParticipantsRepo.save(
            newFallbackAuctionUserEntity,
        );

        const paymentOrder = await this._paymentGatewayService.createOrder({
            userId: input.userId,
            amount: fallbackAuction.getAmount(),
            referenceId: fallbackAuction.getAuctionId(),
        });

        if (paymentOrder.isFailure) return Result.fail(paymentOrder.getError());
        const order = paymentOrder.getValue();

        return Result.ok({
            orderId: order.orderId,
            paymentId: order.orderId,
            amountInPaise: order.amountInPaise,
            currency: order.currency,
            gatewayKey: order.gatewayKey,
        });
    }
}
