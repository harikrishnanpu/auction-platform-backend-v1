import { Bid } from '@domain/entities/auction/bid.entity';
import { Result } from '@domain/shared/result';

export interface IBidRepository {
    create(data: Bid): Promise<Result<Bid>>;

    findLatestByAuctionId(auctionId: string): Promise<Result<Bid | null>>;

    findLastBidsByUser(
        auctionId: string,
        userId: string,
    ): Promise<Result<Bid | null>>;

    findManyByAuctionId(
        auctionId: string,
        limit: number,
    ): Promise<Result<Bid[]>>;
}
