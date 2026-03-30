import { Result } from '@domain/shared/result';

export interface IProcessAuctionWinnerFallbackInput {
    auctionId: string;
    declinedUserId: string;
}

export interface IProcessAuctionWinnerFallbackUsecase {
    execute(input: IProcessAuctionWinnerFallbackInput): Promise<Result<void>>;
}
