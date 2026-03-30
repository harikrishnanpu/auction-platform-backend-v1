import { AUCTION_MESSAGES } from '@domain/constants/auction.constants';
import {
    Auction,
    AuctionStatus,
    AuctionType,
} from '@domain/entities/auction/auction.entity';
import { Bid } from '@domain/entities/auction/bid.entity';
import { Result } from '@domain/shared/result';

export class PlaceBidPolicyService {
    canPlaceBid({
        auction,
        userId,
        userBidAmount,
        latestBid,
        userLatestBid,
    }: {
        auction: Auction;
        userId: string;
        userBidAmount: number;
        latestBid: Bid | null;
        userLatestBid: Bid | null;
    }): Result<void> {
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

        if (userLatestBid) {
            const now = new Date();
            const diff = now.getTime() - userLatestBid.getCreatedAt().getTime();

            if (diff < auction.getBidCooldownSeconds() * 1000) {
                return Result.fail(
                    AUCTION_MESSAGES.COOLDOWN_WAIT(
                        auction.getBidCooldownSeconds(),
                    ),
                );
            }
        }

        if (auction.getAuctionType() !== AuctionType.SEALED) {
            const latestBidAmount = latestBid?.getAmount() ?? 0;
            const nextValidBidAmount =
                latestBidAmount + auction.getMinIncrement();

            if (userBidAmount < nextValidBidAmount) {
                return Result.fail(
                    AUCTION_MESSAGES.BID_BELOW_MIN(
                        userBidAmount,
                        auction.getMinIncrement(),
                    ),
                );
            }
        }

        if (auction.getAuctionType() === AuctionType.SEALED) {
            if (userLatestBid && userLatestBid.getUserId() === userId) {
                return Result.fail(AUCTION_MESSAGES.ONLY_ONE_BID_PER_USER);
            }
        }

        return Result.ok();
    }
}
