import { ICreatePendingPaymentForAuctionInputDto } from '@application/dtos/payments/payment.dto';
import { IAuctionPaymentsStrategy } from '@application/interfaces/strategies/payments/IAuctionPaymentsStrategy';
import { ICreatePendingPaymentForAuctionUsecase } from '@application/interfaces/usecases/payments/ICreatePendingPaymentForUsecase';
import { TYPES } from '@di/types.di';
import { PaymentPhase } from '@domain/entities/payments/payments.entity';
import { IPaymentRepository } from '@domain/repositories/IPaymentRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class CreatePendingPaymentForAuctionUsecase implements ICreatePendingPaymentForAuctionUsecase {
    constructor(
        @inject(TYPES.IAuctionPaymentsStrategy)
        private readonly _auctionPaymentStrategy: IAuctionPaymentsStrategy,
        @inject(TYPES.IPaymentRepository)
        private readonly _paymentRepository: IPaymentRepository,
    ) {}

    async execute(
        input: ICreatePendingPaymentForAuctionInputDto,
    ): Promise<Result<void>> {
        if (!input.userId) {
            return Result.fail('User ID is required');
        }

        const strategyInput = {
            userId: input.userId,
            auctionId: input.auctionId,
            winAmount: input.winAmount,
            endedAt: input.endedAt,
        };

        const existingDeposit =
            await this._paymentRepository.findByReferenceUserAndPhase(
                input.auctionId,
                input.userId,
                PaymentPhase.DEPOSIT,
            );

        if (existingDeposit.isFailure) {
            return Result.fail(existingDeposit.getError());
        }

        const existingBalance =
            await this._paymentRepository.findByReferenceUserAndPhase(
                input.auctionId,
                input.userId,
                PaymentPhase.BALANCE,
            );

        if (existingBalance.isFailure) {
            return Result.fail(existingBalance.getError());
        }

        if (existingDeposit.getValue() || existingBalance.getValue()) {
            return Result.ok();
        }

        const depositPayment =
            await this._auctionPaymentStrategy.createDepositPayment(
                strategyInput,
            );
        if (depositPayment.isFailure) {
            return Result.fail(depositPayment.getError());
        }
        const createdDeposit = await this._paymentRepository.create(
            depositPayment.getValue(),
        );
        if (createdDeposit.isFailure) {
            return Result.fail(createdDeposit.getError());
        }

        const balancePayment =
            await this._auctionPaymentStrategy.createBalancePayment(
                strategyInput,
            );
        if (balancePayment.isFailure) {
            return Result.fail(balancePayment.getError());
        }

        const createdBalance = await this._paymentRepository.create(
            balancePayment.getValue(),
        );

        if (createdBalance.isFailure) {
            return Result.fail(createdBalance.getError());
        }

        return Result.ok();
    }
}
