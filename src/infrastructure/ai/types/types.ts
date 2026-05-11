import type { IGetAuctionRoomUsecase } from '@application/interfaces/usecases/auction/IGetAuctionRoomUsecase';
import type { IGetUserParticipatedAuctionsUsecase } from '@application/interfaces/usecases/auction/IGetUserParticipatedAuctionsUsecase';
import type { IGetUserHomeStatsUsecase } from '@application/interfaces/usecases/user/IGetUserHomeStatsUsecase';

export type ToolPayloadDto = {
    userId: string;
    auctionId?: string;
};

export type Tools = {
    getAuctionRoom: IGetAuctionRoomUsecase;
    getParticipatedAuctions: IGetUserParticipatedAuctionsUsecase;
    getHomeStats: IGetUserHomeStatsUsecase;
};
