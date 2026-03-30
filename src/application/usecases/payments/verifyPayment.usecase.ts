import { IVerifyPaymentInputDto } from '@application/dtos/payments/payment.dto';
import { IPaymentGatewayService } from '@application/interfaces/services/IPaymentGatewayService';
import { IVerifyPaymentUsecase } from '@application/interfaces/usecases/payments/IVerifyPaymentUsecase';
import { TYPES } from '@di/types.di';
import { PaymentStatus } from '@domain/entities/payments/payments.entity';
import { IPaymentRepository } from '@domain/repositories/IPaymentRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class VerifyPaymentUsecase implements IVerifyPaymentUsecase {
    constructor(
        @inject(TYPES.IPaymentRepository)
        private readonly _paymentRepository: IPaymentRepository,
        @inject(TYPES.IPaymentGatewayService)
        private readonly _paymentGatewayService: IPaymentGatewayService,
    ) {}

    async execute(input: IVerifyPaymentInputDto): Promise<Result<void>> {
        const paymentResult = await this._paymentRepository.findById(
            input.paymentId,
        );
        if (paymentResult.isFailure)
            return Result.fail(paymentResult.getError());

        const payment = paymentResult.getValue();
        if (!payment) return Result.fail('Payment request not found');
        if (payment.getUserId() !== input.userId) {
            return Result.fail('Not authorized to verify this payment');
        }

        if (payment.getStatus() === PaymentStatus.COMPLETED) return Result.ok();
        if (payment.getStatus() !== PaymentStatus.PENDING) {
            return Result.fail('Only pending payments can be verified');
        }

        const verify = await this._paymentGatewayService.verifyPayment({
            userId: payment.getUserId(),
            orderId: input.orderId,
            paymentId: input.gatewayPaymentId,
            signature: input.signature,
            expectedPaymentId: payment.getId(),
        });

        if (verify.isFailure) return Result.fail(verify.getError());

        const completed = payment.markAsCompleted();
        if (completed.isFailure) return Result.fail(completed.getError());

        const updated = await this._paymentRepository.update(payment);
        if (updated.isFailure) return Result.fail(updated.getError());

        return Result.ok();
    }
}
