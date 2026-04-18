export interface IGetUserHomeStatsInputDto {
    userId: string;
}

export interface IGetUserHomeStatsOutputDto {
    liveCount: number;
    upcomingCount: number;
    endedCount: number;
    participatedCount: number;
}
