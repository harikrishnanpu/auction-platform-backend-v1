import { Auction, AuctionType } from '@domain/entities/auction/auction.entity';

export class ShouldExtendAuctionPolicy {
    static shouldExtendAuction(auction: Auction, remainingMs: number): boolean {
        switch (auction.getAuctionType()) {
            case AuctionType.LONG: {
                const antiSnipMs = auction.getAntiSnipSeconds() * 1000;
                if (antiSnipMs <= 0) {
                    return false;
                }
                return (
                    remainingMs > 0 &&
                    remainingMs <= antiSnipMs &&
                    auction.getExtensionCount() < auction.getMaxExtensionCount()
                );
            }
            case AuctionType.SEALED:
                return false;
            default:
                return false;
        }
    }
}
