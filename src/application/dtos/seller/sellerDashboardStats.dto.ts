export interface ISellerDashboardStatsStatusCountDto {
    status: string;
    count: number;
}

export interface ISellerDashboardStatsDto {
    auctions: {
        total: number;
        byStatus: ISellerDashboardStatsStatusCountDto[];
        liveListingsCount: number;
    };
    payments: {
        total: number;
        byStatus: ISellerDashboardStatsStatusCountDto[];
        completedAmountSum: number;
    };
}
