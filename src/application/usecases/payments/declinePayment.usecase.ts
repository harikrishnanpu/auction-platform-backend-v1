import { IWinnerFallbackQueue } from '@application/interfaces/queue/IWinnerFallbackQueue';
import {
    IDeclinePaymentInputDto,
    IDeclinePaymentUsecase,
} from '@application/interfaces/usecases/payments/IDeclinePaymentUsecase';
import { TYPES } from '@di/types.di';
import { AuctionStatus } from '@domain/entities/auction/auction.entity';
import {
    PaymentFor,
    PaymentStatus,
} from '@domain/entities/payments/payments.entity';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { IPaymentRepository } from '@domain/repositories/IPaymentRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class DeclinePaymentUsecase implements IDeclinePaymentUsecase {
    constructor(
        @inject(TYPES.IPaymentRepository)
        private readonly _paymentRepository: IPaymentRepository,
        @inject(TYPES.IAuctionRepository)
        private readonly _auctionRepository: IAuctionRepository,
        @inject(TYPES.IWinnerFallbackQueue)
        private readonly _winnerFallbackQueue: IWinnerFallbackQueue,
    ) {}

    async execute(input: IDeclinePaymentInputDto): Promise<Result<void>> {
        const paymentResult = await this._paymentRepository.findById(
            input.paymentId,
        );
        if (paymentResult.isFailure) {
            return Result.fail(paymentResult.getError());
        }

        const payment = paymentResult.getValue();
        if (!payment) {
            return Result.fail('Payment not found');
        }

        if (payment.getUserId() !== input.userId) {
            return Result.fail('Not authorized to decline this payment');
        }

        if (payment.getStatus() === PaymentStatus.DECLINED) {
            return Result.ok();
        }

        if (payment.getStatus() !== PaymentStatus.PENDING) {
            return Result.fail('Only pending payments can be declined');
        }

        const marked = payment.markAsDeclined();
        if (marked.isFailure) {
            return Result.fail(marked.getError());
        }

        const updated = await this._paymentRepository.update(payment);
        if (updated.isFailure) {
            return Result.fail(updated.getError());
        }

        if (
            payment.getForPayment() === PaymentFor.AUCTION &&
            payment.getReferenceId()
        ) {
            const auctionResult = await this._auctionRepository.findById(
                payment.getReferenceId(),
            );
            if (auctionResult.isSuccess) {
                const auction = auctionResult.getValue();
                const status = auction.getStatus();
                const ended =
                    status === AuctionStatus.ENDED ||
                    status === AuctionStatus.SOLD;
                if (ended && auction.getWinnerId() === input.userId) {
                    await this._winnerFallbackQueue.enqueue({
                        auctionId: auction.getId(),
                        declinedUserId: input.userId,
                        paymentId: payment.getId(),
                    });
                }
            }
        }

        return Result.ok();
    }
}
