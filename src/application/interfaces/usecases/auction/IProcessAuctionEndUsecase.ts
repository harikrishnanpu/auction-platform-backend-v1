import { Result } from '@domain/shared/result';

export interface IProcessAuctionEndInput {
    auctionId: string;
    auctionTitle: string;
    winnerId: string | null;
    winAmount: number;
    endedAt: Date;
}

export interface IProcessAuctionEndNotificationUsecase {
    execute(input: IProcessAuctionEndInput): Promise<Result<void>>;
}
