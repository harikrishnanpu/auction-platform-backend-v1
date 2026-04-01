import { Result } from '@domain/shared/result';

export interface IGetFallBackAuctionWinnerInput {
    auctionId: string;
    declinedUserId: string;
}

export interface IGetFallBackAuctionWinnerOutput {
    winnerId: string | null;
    winAmount: number | null;
    rank: number;
}

export interface IGetFallBackAuctionWinnerStrategy {
    execute(
        input: IGetFallBackAuctionWinnerInput,
    ): Promise<Result<IGetFallBackAuctionWinnerOutput>>;
}
