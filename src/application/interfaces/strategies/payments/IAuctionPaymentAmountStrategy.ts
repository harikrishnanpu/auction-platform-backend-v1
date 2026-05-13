import { Result } from '@domain/shared/result';

export interface IAuctionWinningAmountSplit {
    deposit: number;
    balance: number;
}

export interface IAuctionPaymentAmountSplitStrategy {
    splitWinningAmount(
        winAmount: number,
    ): Promise<Result<IAuctionWinningAmountSplit>>;
}
