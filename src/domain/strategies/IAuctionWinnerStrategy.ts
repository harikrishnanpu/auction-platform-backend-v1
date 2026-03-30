import { Auction } from '@domain/entities/auction/auction.entity';
import { Result } from '@domain/shared/result';

export interface IAuctionWinnerResult {
    winnerId: string | null;
    winAmount: number;
}

export interface IAuctionWinnerStrategy {
    validateAndGetWinner({
        auction,
    }: {
        auction: Auction;
    }): Promise<Result<IAuctionWinnerResult>>;
}
