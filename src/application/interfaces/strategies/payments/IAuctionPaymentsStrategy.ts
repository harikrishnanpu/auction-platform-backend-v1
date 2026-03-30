import { Payments } from '@domain/entities/payments/payments.entity';
import { Result } from '@domain/shared/result';

export interface IAuctionPaymentsStrategyInput {
    userId: string;
    auctionId: string;
    winAmount: number;
    endedAt: Date;
}

export interface IAuctionPaymentsStrategy {
    createDepositPayment(
        input: IAuctionPaymentsStrategyInput,
    ): Promise<Result<Payments>>;
    createBalancePayment(
        input: IAuctionPaymentsStrategyInput,
    ): Promise<Result<Payments>>;
}
