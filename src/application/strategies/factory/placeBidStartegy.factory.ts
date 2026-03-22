import { IPlaceBidStrategy } from '@application/interfaces/strategies/auction/placeBid.strategy';
import { AuctionType } from '@domain/entities/auction/auction.entity';
import { PlaceLongAuctionBidStrategy } from '../auction/long-bid.placebid.strategy';
import { PlaceSealedAuctionBidStrategy } from '../auction/sealed-bid.placebid.startegy';

export class PlaceBidStartegyFactory {
  static create(auctionType: AuctionType): IPlaceBidStrategy {
    switch (auctionType) {
      case AuctionType.LONG:
        return new PlaceLongAuctionBidStrategy();
      case AuctionType.SEALED:
        return new PlaceSealedAuctionBidStrategy();
      default:
        return new PlaceLongAuctionBidStrategy();
    }
  }
}
