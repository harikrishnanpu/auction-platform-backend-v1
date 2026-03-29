import { Auction, AuctionType } from '@domain/entities/auction/auction.entity';

export class ShouldExtendAuctionPolicy {
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
