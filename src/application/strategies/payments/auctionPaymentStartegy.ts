import {
    IAuctionPaymentsStrategy,
    IAuctionPaymentsStrategyInput,
} from '@application/interfaces/strategies/payments/IAuctionPaymentsStrategy';
import { ISystemConfigService } from '@application/interfaces/services/ISystemConfigService';
import { TYPES } from '@di/types.di';
import { inject, injectable } from 'inversify';
import { Result } from '@domain/shared/result';
import {
    PaymentFor,
    PaymentPhase,
    Payments,
    PaymentStatus,
} from '@domain/entities/payments/payments.entity';
import { IAuctionPaymentAmountSplitStrategy } from '@application/interfaces/strategies/payments/IAuctionPaymentAmountStrategy';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';

@injectable()
export class AuctionPaymentStrategy implements IAuctionPaymentsStrategy {
    constructor(
        @inject(TYPES.IAuctionPaymentAmountSplitStrategy)
        private readonly _amountSplitStrategy: IAuctionPaymentAmountSplitStrategy,
        @inject(TYPES.IIdGeneratingService)
        private readonly _idGeneratingService: IIdGeneratingService,
        @inject(TYPES.ISystemConfigService)
        private readonly _systemConfigService: ISystemConfigService,
    ) {}

    async createDepositPayment(
        input: IAuctionPaymentsStrategyInput,
    ): Promise<Result<Payments>> {
        const splitResult = await this._amountSplitStrategy.splitWinningAmount(
            input.winAmount,
        );
        if (splitResult.isFailure) {
            return Result.fail(splitResult.getError());
        }
        const calculateDeposit = splitResult.getValue();

        const depositMsResult =
            await this._systemConfigService.getAuctionPaymentDepositDueMs();
        if (depositMsResult.isFailure) {
            return Result.fail(depositMsResult.getError());
        }

        const depositDueAt = new Date(
            new Date(input.endedAt).getTime() + depositMsResult.getValue(),
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
        const splitResult = await this._amountSplitStrategy.splitWinningAmount(
            input.winAmount,
        );
        if (splitResult.isFailure) {
            return Result.fail(splitResult.getError());
        }
        const calculateBalance = splitResult.getValue();

        const balanceMsResult =
            await this._systemConfigService.getAuctionPaymentBalanceDueMs();
        if (balanceMsResult.isFailure) {
            return Result.fail(balanceMsResult.getError());
        }

        const balanceDueAt = new Date(
            new Date(input.endedAt).getTime() + balanceMsResult.getValue(),
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
