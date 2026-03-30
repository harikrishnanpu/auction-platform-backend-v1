import { Auction, AuctionType } from '@domain/entities/auction/auction.entity';
import { TYPES } from '@di/types.di';
import { Bid } from '@domain/entities/auction/bid.entity';
import { inject, injectable } from 'inversify';
import { LongAuctionPlaceBidStrategy } from '@application/strategies/auction/long-auction.placeBid.strategy';
import { SealedAuctionPlaceBidStartegy } from '@application/strategies/auction/sealedAuction.placeBid.startegy';
import { IPlaceBidStrategy } from '@domain/strategies/IPlaceBidStrategy';

export interface IPlaceBidPolicyInput {
    userId: string;
    newBid: Bid;
    auction: Auction;
    userLatestBid: Bid | null;
    latestAuctionBid: Bid | null;
}

@injectable()
export class PlaceBidStartegyFactory {
    constructor(
        @inject(TYPES.LongAuctionPlaceBidStrategy)
        private readonly _longAuctionPlaceBidStrategy: LongAuctionPlaceBidStrategy,
        @inject(TYPES.SealedAuctionPlaceBidStartegy)
        private readonly _sealedAuctionPlaceBidStrategy: SealedAuctionPlaceBidStartegy,
    ) {}

    getStrategy(auctionType: AuctionType): IPlaceBidStrategy {
        switch (auctionType) {
            case AuctionType.LONG:
                return this._longAuctionPlaceBidStrategy;
            case AuctionType.SEALED:
                return this._sealedAuctionPlaceBidStrategy;
            default:
                return this._longAuctionPlaceBidStrategy;
        }
    }
}
