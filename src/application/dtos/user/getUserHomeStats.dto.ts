export interface IGetUserHomeStatsInputDto {
    userId: string;
}

export interface IGetUserHomeStatsOutputDto {
    liveCount: number;
    upcomingCount: number;
    endedCount: number;
    participatedCount: number;
    liveWinningCount: number;
    liveLosingCount: number;
    wonCount: number;
    lostCount: number;
}
