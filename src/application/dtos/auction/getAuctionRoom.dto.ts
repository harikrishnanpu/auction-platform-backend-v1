import { IAuctionDto } from './auction.dto';

export type AuctionRoomMode = 'SELLER' | 'USER' | 'ADMIN';

export interface IAuctionRoomBidDto {
    id: string;
    auctionId: string;
    userId: string;
    amount: number | null;
    createdAt: string;
}

export interface IFallbackPublicParticipantStatsDto {
    pending: number;
    rejected: number;
}

export interface IAuctionSoldSummaryDto {
    winnerUserName: string;
    winnerUserId: string;
    soldAmount: number;
}

export interface IAuctionRoomAutoBidConfigDto {
    id: string;
    strategy: 'SLOW' | 'FASTER' | 'SNIPER';
    maxBidAmount: number;
    isActive: boolean;
}

export interface IAuctionRoomResultDto {
    auction: IAuctionDto;
    currentBid: IAuctionRoomBidDto | null;
    nextBidMin: number | null;
    liveFeed: IAuctionRoomBidDto[];
    participants: IAuctionRoomParticipantDto[];
    fallbackPublicParticipantStats?: IFallbackPublicParticipantStatsDto;
    soldSummary?: IAuctionSoldSummaryDto;
    autoBidConfig?: IAuctionRoomAutoBidConfigDto | null;
}

export interface IAuctionRoomParticipantDto {
    id: string;
    auctionId: string;
    userId: string;
    userName: string;
    joinedAt: string;
}

export interface IGetAuctionRoomInputDto {
    userId: string;
    auctionId: string;
    mode: AuctionRoomMode;
}
