export interface IAuctionWinningAmountSplit {
    deposit: number;
    balance: number;
}

export interface IAuctionPaymentAmountSplitStrategy {
    splitWinningAmount(winAmount: number): IAuctionWinningAmountSplit;
}
