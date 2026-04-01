import { AuctionWinner } from '@domain/entities/auction/auction-winner.entity';
import { Result } from '@domain/shared/result';

export interface IAuctionWinnerRepository {
    save(auctionWinner: AuctionWinner): Promise<Result<void>>;
    findById(id: string): Promise<Result<AuctionWinner | null>>;
    findAllByAuctionId(auctionId: string): Promise<Result<AuctionWinner[]>>;
    findAllByUserId(userId: string): Promise<Result<AuctionWinner[]>>;
}
