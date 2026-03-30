import {
    IAuctionPaymentsStrategy,
    IAuctionPaymentsStrategyInput,
} from '@application/interfaces/strategies/payments/IAuctionPaymentsStrategy';
import { TYPES } from '@di/types.di';
import { inject, injectable } from 'inversify';
import { IPaymentRepository } from '@domain/repositories/IPaymentRepository';
import { Result } from '@domain/shared/result';
import {
    PaymentFor,
    PaymentPhase,
    Payments,
    PaymentStatus,
} from '@domain/entities/payments/payments.entity';
import { IAuctionPaymentAmountSplitStrategy } from '@application/interfaces/strategies/payments/IAuctionPaymentAmountStrategy';
import { AUCTION_PAYMENT_DUE_AT_STRATEGY } from '@domain/constants/auction.constants';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';

@injectable()
export class AuctionPaymentStrategy implements IAuctionPaymentsStrategy {
    constructor(
        @inject(TYPES.IPaymentRepository)
        private readonly _paymentRepository: IPaymentRepository,
        @inject(TYPES.IAuctionPaymentAmountSplitStrategy)
        private readonly _amountSplitStrategy: IAuctionPaymentAmountSplitStrategy,
        @inject(TYPES.IIdGeneratingService)
        private readonly _idGeneratingService: IIdGeneratingService,
    ) {}

    async createDepositPayment(
        input: IAuctionPaymentsStrategyInput,
    ): Promise<Result<Payments>> {
        const calculateDeposit = this._amountSplitStrategy.splitWinningAmount(
            input.winAmount,
        );

        const depositDueAt = new Date(
            new Date(input.endedAt).getTime() +
                AUCTION_PAYMENT_DUE_AT_STRATEGY.DEPOSIT_DAYS_MS,
        );

        const depositPayment = Payments.create({
            id: this._idGeneratingService.generateId(),
            userId: input.userId,
            amount: calculateDeposit.deposit,
            currency: 'INR',
            status: PaymentStatus.PENDING,
            forPayment: PaymentFor.AUCTION,
            referenceId: input.auctionId,
            phase: PaymentPhase.DEPOSIT,
            dueAt: depositDueAt,
            createdAt: new Date(),
        });

        if (depositPayment.isFailure)
            return Result.fail(depositPayment.getError());

        return Result.ok(depositPayment.getValue());
    }

    async createBalancePayment(
        input: IAuctionPaymentsStrategyInput,
    ): Promise<Result<Payments>> {
        const calculateBalance = this._amountSplitStrategy.splitWinningAmount(
            input.winAmount,
        );

        const balanceDueAt = new Date(
            new Date(input.endedAt).getTime() +
                AUCTION_PAYMENT_DUE_AT_STRATEGY.BALANCE_MONTHS_MS,
        );

        const balancePayment = Payments.create({
            id: this._idGeneratingService.generateId(),
            userId: input.userId,
            amount: calculateBalance.balance,
            currency: 'INR',
            status: PaymentStatus.PENDING,
            forPayment: PaymentFor.AUCTION,
            referenceId: input.auctionId,
            phase: PaymentPhase.BALANCE,
            dueAt: balanceDueAt,
            createdAt: new Date(),
        });

        if (balancePayment.isFailure)
            return Result.fail(balancePayment.getError());

        return Result.ok(balancePayment.getValue());
    }
}
