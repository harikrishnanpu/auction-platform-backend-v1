import { Result } from '@domain/shared/result';

export interface IProcessWinnerFallbackInput {
    auctionId: string;
    declinedUserId: string;
}

export interface IProcessWinnerFallbackUsecase {
    execute(input: IProcessWinnerFallbackInput): Promise<Result<void>>;
}
