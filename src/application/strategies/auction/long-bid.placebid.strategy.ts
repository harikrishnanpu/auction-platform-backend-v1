import {
    IPlaceBidInput,
    IValidatedBidPayload,
} from '@application/dtos/auction/place-bid.dto';
import { IPlaceBidStrategy } from '@application/interfaces/strategies/auction/placeBid.strategy';
import { AUCTION_MESSAGES } from '@application/constants/auction/auction.constants';
import { Auction } from '@domain/entities/auction/auction.entity';
import { Bid } from '@domain/entities/auction/bid.entity';
import { Result } from '@domain/shared/result';

export class PlaceLongAuctionBidStrategy implements IPlaceBidStrategy {
    validate(data: IPlaceBidInput): Result<IValidatedBidPayload> {
        return Result.ok({
            amount: data.amount,
            encryptedAmount: null,
        });
    }

    applyRules({
        input,
        auction,
        latestBid,
    }: {
        input: IPlaceBidInput;
        auction: Auction;
        latestBid: Bid | null;
    }): Result<void> {
        const latestAmount = latestBid?.getAmount() ?? null;

        if (latestAmount !== null) {
            const minAllowed = latestAmount + auction.getMinIncrement();
            if (input.amount < minAllowed) {
                return Result.fail(
                    AUCTION_MESSAGES.BID_BELOW_MIN(
                        minAllowed,
                        auction.getMinIncrement(),
                    ),
                );
            }
            return Result.ok();
        }

        if (input.amount < auction.getStartPrice()) {
            return Result.fail(AUCTION_MESSAGES.BID_BELOW_LATEST);
        }

        return Result.ok();
    }
}
