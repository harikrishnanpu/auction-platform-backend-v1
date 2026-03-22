import { AuctionType } from '@domain/entities/auction/auction.entity';
import { LongAuctionCreateStrategy } from '../auction/long-auction.strategy';
import { SealedAuctionCreateStrategy } from '../auction/sealed-auction.strategy';
import { IAuctionCreateStrategy } from '@application/interfaces/strategies/auction/auction-create.strategy';

export class AuctionCreateStartegyFactory {
  static create(auctionType: AuctionType): IAuctionCreateStrategy {
    switch (auctionType) {
      case AuctionType.LONG:
        return new LongAuctionCreateStrategy();
      case AuctionType.SEALED:
        return new SealedAuctionCreateStrategy();
      default:
        return new LongAuctionCreateStrategy();
    }
  }
}
