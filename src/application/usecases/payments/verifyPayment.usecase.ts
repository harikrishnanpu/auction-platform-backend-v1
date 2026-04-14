import { IVerifyPaymentInputDto } from '@application/dtos/payments/payment.dto';
import { IPaymentGatewayService } from '@application/interfaces/services/IPaymentGatewayService';
import { IVerifyPaymentUsecase } from '@application/interfaces/usecases/payments/IVerifyPaymentUsecase';
import { PaymentsMapperProfile } from '@application/mappers/payments/paymentsProfile.mapper';
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
        const dto = PaymentsMapperProfile.toVerifyPaymentInput(input);

        const paymentResult = await this._paymentRepository.findById(
            dto.paymentId,
        );
        if (paymentResult.isFailure)
            return Result.fail(paymentResult.getError());

        const payment = paymentResult.getValue();
        if (!payment) return Result.fail('Payment request not found');
        if (payment.getUserId() !== dto.userId) {
            return Result.fail('Not authorized to verify this payment');
        }

        if (payment.getStatus() === PaymentStatus.COMPLETED) return Result.ok();
        if (payment.getStatus() !== PaymentStatus.PENDING) {
            return Result.fail('Only pending payments can be verified');
        }

        const verify = await this._paymentGatewayService.verifyPayment({
            userId: payment.getUserId(),
            orderId: dto.orderId,
            paymentId: dto.gatewayPaymentId,
            signature: dto.signature,
            referenceId: payment.getReferenceId(),
        });

        if (verify.isFailure) return Result.fail(verify.getError());

        const completed = payment.markAsCompleted();
        if (completed.isFailure) return Result.fail(completed.getError());

        const updated = await this._paymentRepository.update(
            payment.getId(),
            payment,
        );
        if (updated.isFailure) return Result.fail(updated.getError());

        return Result.ok();
    }
}
