import { Result } from '@domain/shared/result';

export interface AuctionBidLeaderboardEntry {
    userId: string;
    winningAmount: number;
}

export interface IAuctionBidLeaderboardService {
    getRankedUniqueBidders(
        auctionId: string,
    ): Promise<Result<AuctionBidLeaderboardEntry[]>>;
}
