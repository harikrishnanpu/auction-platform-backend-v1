import { Auction } from '@domain/entities/auction/auction.entity';
import { Result } from '@domain/shared/result';
import {
    IAuctionStatsPublicCounts,
    IAuctionUserDashboardCounts,
    IFindAllAuctionsFilters,
} from '@domain/types/auctionRepo.types';

export interface IAuctionRepository {
    save(auction: Auction): Promise<Result<Auction>>;
    findById(id: string): Promise<Result<Auction>>;
    findBySellerId(sellerId: string): Promise<Result<Auction[]>>;
    findAll(filters: IFindAllAuctionsFilters): Promise<Result<Auction[]>>;
    findAllForUsers(
        filters: IFindAllAuctionsFilters,
    ): Promise<Result<Auction[]>>;

    findParticipatedByUserId(
        userId: string,
        filters: IFindAllAuctionsFilters,
    ): Promise<
        Result<{
            auctions: Auction[];
            total: number;
            leadBidderUserIdByAuctionId: Map<string, string | null>;
        }>
    >;

    countAuctionStats(): Promise<Result<IAuctionStatsPublicCounts>>;
    countParticipatedByUserId(userId: string): Promise<Result<number>>;
    countAdminVisibleAuctions(): Promise<Result<number>>;

    getUserDahsboardAuctionStats(
        userId: string,
    ): Promise<Result<IAuctionUserDashboardCounts>>;
}
