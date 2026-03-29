import { Result } from '@domain/shared/result';

export interface IGetFallBackAuctionWinnerInput {
    auctionId: string;
    declinedUserId: string;
}

export interface IGetFallBackAuctionWinnerOutput {
    winnerId: string | null;
    winningAmount: number | null;
}

export interface IGetFallBackAuctionWinnerStrategy {
    execute(
        input: IGetFallBackAuctionWinnerInput,
    ): Promise<Result<IGetFallBackAuctionWinnerOutput>>;
}
