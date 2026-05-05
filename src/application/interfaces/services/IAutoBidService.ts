import { Auction } from '@domain/entities/auction/auction.entity';
import { Result } from '@domain/shared/result';

export interface IAutoBid {
    id: string;
    auctionId: string;
    userId: string;
    amount: number | null;
    createdAt: string;
    endAt: string;
    extensionCount: number;
}

export interface IAutoBidResult {
    placedBids: IAutoBid[];
}

export interface IAutoBidService {
    handleAuctionPlaceBid(input: {
        auction: Auction;
        latestBidAmount: number | null;
        triggeringUserId: string;
    }): Promise<Result<IAutoBidResult>>;
}
