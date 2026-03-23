import { IPlaceBidStrategy } from '@application/interfaces/strategies/auction/placeBid.strategy';
import { Auction, AuctionType } from '@domain/entities/auction/auction.entity';
import { container } from '@di/container';
import { TYPES } from '@di/types.di';

export class PlaceBidStartegyFactory {
    static create(auctionType: AuctionType): IPlaceBidStrategy {
        switch (auctionType) {
            case AuctionType.LONG:
                return container.get<IPlaceBidStrategy>(
                    TYPES.PlaceLongAuctionBidStrategy,
                );
            case AuctionType.SEALED:
                return container.get<IPlaceBidStrategy>(
                    TYPES.PlaceSealedAuctionBidStrategy,
                );
            default:
                return container.get<IPlaceBidStrategy>(
                    TYPES.PlaceLongAuctionBidStrategy,
                );
        }
    }

    static shouldExtendAuction(
        auction: Auction,
        remainingSec: number,
    ): boolean {
        switch (auction.getAuctionType()) {
            case AuctionType.LONG:
                return (
                    remainingSec <= auction.getAntiSnipSeconds() &&
                    auction.getExtensionCount() < auction.getMaxExtensionCount()
                );
            case AuctionType.SEALED:
                return false;
            default:
                return false;
        }
    }
}
