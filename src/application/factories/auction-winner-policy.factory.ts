import { IAuctionWinnerStrategy } from '@domain/strategies/IAuctionWinnerStrategy';
import { TYPES } from '@di/types.di';
import { AuctionType } from '@domain/entities/auction/auction.entity';
import { inject, injectable } from 'inversify';
import { LongAuctionWinnerStrategy } from '@application/strategies/auction/long-auction-winner.strategy';

@injectable()
export class AuctionWinnerStrategyFactory {
    constructor(
        @inject(TYPES.LongAuctionWinnerStrategy)
        private readonly _longAuctionWinnerStrategy: LongAuctionWinnerStrategy,
        @inject(TYPES.SealedAuctionWinnerStrategy)
        private readonly _sealedAuctionWinnerStrategy: IAuctionWinnerStrategy,
    ) {}

    getStrategy(auctionType: AuctionType): IAuctionWinnerStrategy {
        switch (auctionType) {
            case AuctionType.LONG:
                return this._longAuctionWinnerStrategy;
            case AuctionType.SEALED:
                return this._sealedAuctionWinnerStrategy;
            default:
                return this._longAuctionWinnerStrategy;
        }
    }
}
