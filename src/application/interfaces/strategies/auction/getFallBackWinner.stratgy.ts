import { Result } from '@domain/shared/result';

export interface IGetFallBackAuctionWinnerInput {
    auctionId: string;
    declinedUserId: string;
}

export interface IGetFallBackAuctionWinnerOutput {
    winnerId: string | null;
    winAmount: number | null;
    rank: number;
    isFallbackFailed: boolean;
}

export interface IGetFallBackAuctionWinnerStrategy {
    execute(
        input: IGetFallBackAuctionWinnerInput,
    ): Promise<Result<IGetFallBackAuctionWinnerOutput>>;
}
