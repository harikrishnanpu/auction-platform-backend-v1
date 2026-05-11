import {
    AuctionStatus,
    AuctionType,
} from '@domain/entities/auction/auction.entity';

export interface IFindAllAuctionsFilters {
    categoryId?: string;
    auctionType?: AuctionType | 'ALL';
    status?: AuctionStatus | 'ALL';
    page: number;
    limit: number;
    sort: string | 'createdAt';
    order: 'asc' | 'desc';
    search?: string;
    sellerId?: string;
    scope?: 'default' | 'ending_soon';
}

export interface IAuctionStatsPublicCounts {
    liveCount: number;
    upcomingCount: number;
    endedCount: number;
}

export interface IAuctionUserDashboardCounts {
    liveWinningCount: number;
    liveLosingCount: number;
    wonCount: number;
    lostCount: number;
}
