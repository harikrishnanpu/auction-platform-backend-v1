import { AUCTION_MESSAGES } from '@domain/constants/auction.constants';
import {
    Auction,
    AuctionStatus,
    AuctionType,
} from '@domain/entities/auction/auction.entity';
import { Bid } from '@domain/entities/auction/bid.entity';
import { Result } from '@domain/shared/result';

export class PlaceBidPolicyService {
    canPlaceBid(
        auction: Auction,
        userId: string,
        nextBidAmount: number,
        newBid: Bid,
        latestBid: Bid | null,
    ): Result<void> {
        if (auction.getStatus() !== AuctionStatus.ACTIVE) {
            return Result.fail(AUCTION_MESSAGES.AUCTION_NOT_ACTIVE);
        }

        if (auction.getStartAt().getTime() > Date.now()) {
            return Result.fail(AUCTION_MESSAGES.AUCTION_NOT_STARTED);
        }

        if (auction.getEndAt().getTime() <= Date.now()) {
            return Result.fail(AUCTION_MESSAGES.AUCTION_ENDED);
        }

        if (auction.getSellerId() === userId) {
            return Result.fail(AUCTION_MESSAGES.SELLER_CANNOT_PLACE_BID);
        }

        if (latestBid) {
            const now = new Date();
            const diff = now.getTime() - latestBid.getCreatedAt().getTime();

            if (diff < auction.getBidCooldownSeconds() * 1000) {
                return Result.fail(
                    AUCTION_MESSAGES.COOLDOWN_WAIT(
                        auction.getBidCooldownSeconds(),
                    ),
                );
            }
        }

        if (AuctionType.SEALED !== auction.getAuctionType()) {
            if (nextBidAmount <= (newBid?.getAmount() ?? 0)) {
                return Result.fail(
                    AUCTION_MESSAGES.BID_BELOW_MIN(
                        nextBidAmount,
                        auction.getMinIncrement(),
                    ),
                );
            }
        }

        return Result.ok();
    }
}
