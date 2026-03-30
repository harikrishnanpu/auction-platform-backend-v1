import { Auction } from '@domain/entities/auction/auction.entity';
import { Bid } from '@domain/entities/auction/bid.entity';
import { Result } from '@domain/shared/result';

export interface IPlaceBidStrategy {
    validateAndCreateBid(input: {
        auction: Auction;
        userId: string;
        amount: number;
        latestBid: Bid | null;
        userLatestBid: Bid | null;
    }): Result<Bid>;
}
