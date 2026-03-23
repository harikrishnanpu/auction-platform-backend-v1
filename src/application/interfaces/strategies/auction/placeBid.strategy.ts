import {
    IPlaceBidInput,
    IValidatedBidPayload,
} from '@application/dtos/auction/place-bid.dto';
import { Auction } from '@domain/entities/auction/auction.entity';
import { Bid } from '@domain/entities/auction/bid.entity';
import { Result } from '@domain/shared/result';

export interface IPlaceBidStrategy {
    validate(data: IPlaceBidInput): Result<IValidatedBidPayload>;

    applyRules(params: {
        input: IPlaceBidInput;
        auction: Auction;
        latestBid: Bid | null;
    }): Result<void>;
}
