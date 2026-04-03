import {
    ICreatePaymentOrderInputDto,
    ICreatePaymentOrderOutputDto,
} from '@application/dtos/payments/payment.dto';
import { IPaymentGatewayService } from '@application/interfaces/services/IPaymentGatewayService';
import { ICreatePaymentOrderUsecase } from '@application/interfaces/usecases/payments/ICreatePaymentOrderUsecase';
import { TYPES } from '@di/types.di';
import { PaymentStatus } from '@domain/entities/payments/payments.entity';
import { IPaymentRepository } from '@domain/repositories/IPaymentRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class CreatePaymentOrderUsecase implements ICreatePaymentOrderUsecase {
    constructor(
        @inject(TYPES.IPaymentRepository)
        private readonly _paymentRepository: IPaymentRepository,
        @inject(TYPES.IPaymentGatewayService)
        private readonly _paymentGatewayService: IPaymentGatewayService,
    ) {}

    async execute(
        input: ICreatePaymentOrderInputDto,
    ): Promise<Result<ICreatePaymentOrderOutputDto>> {
        const paymentResult = await this._paymentRepository.findById(
            input.paymentId,
        );

        if (paymentResult.isFailure)
            return Result.fail(paymentResult.getError());

        const payment = paymentResult.getValue();
        if (!payment) return Result.fail('Payment request not found');

        if (payment.getUserId() !== input.userId) {
            return Result.fail('Not authorized to pay this request');
        }

        if (payment.getStatus() !== PaymentStatus.PENDING) {
            return Result.fail('Only pending payments can be processed');
        }

        const orderResult = await this._paymentGatewayService.createOrder({
            userId: input.userId,
            amount: payment.getAmount(),
            referenceId: payment.getId(),
        });

        if (orderResult.isFailure) return Result.fail(orderResult.getError());

        const order = orderResult.getValue();
        return Result.ok({
            paymentId: payment.getId(),
            orderId: order.orderId,
            amountInPaise: order.amountInPaise,
            currency: order.currency,
            gatewayKey: order.gatewayKey,
        });
    }
}
