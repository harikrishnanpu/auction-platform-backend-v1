import {
    IAuctionPaymentAmountSplitStrategy,
    IAuctionWinningAmountSplit,
} from '@application/interfaces/strategies/payments/IAuctionPaymentAmountStrategy';
import { AUCTION_PAYMENT_AMOUNT_SPLIT_STRATEGY } from '@domain/constants/auction.constants';
import { injectable } from 'inversify';

@injectable()
export class AuctionPaymentAmountSplitStrategy implements IAuctionPaymentAmountSplitStrategy {
    splitWinningAmount(winAmount: number): IAuctionWinningAmountSplit {
        const deposit = Math.floor(
            winAmount *
                AUCTION_PAYMENT_AMOUNT_SPLIT_STRATEGY.DEPOSIT_PERCENTAGE,
        );
        const balance = winAmount - deposit;
        return { deposit, balance };
    }
}
