import type { IAuctionRoomBidDto } from './getAuctionRoom.dto';

export interface IGetAuctionBidsInputDto {
    auctionId: string;
    userId: string;
}

export interface IGetAuctionBidsOutputDto {
    bids: IAuctionRoomBidDto[];
    total: number;
}
