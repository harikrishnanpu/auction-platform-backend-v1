export interface IGetAdminDashboardStatsOutputDto {
    totalUsers: number;
    suspendedUsers: number;
    activeSellers: number;
    pendingKyc: number;
    totalAuctions: number;
    liveAuctions: number;
    /** Browse-style lifecycle buckets (same semantics as public auction stats). */
    upcomingAuctions: number;
    endedAuctions: number;
    /** Users who have at least the buyer (USER) role. */
    buyerUsers: number;
    /** Users who have at least the ADMIN role. */
    adminUsers: number;
}
