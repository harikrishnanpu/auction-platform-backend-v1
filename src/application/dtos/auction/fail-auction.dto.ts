import { AuctionStatus } from '@domain/entities/auction/auction.entity';

export interface IFailAuctionInputDto {
    auctionId: string;
    reason: string;
}

export interface IFailAuctionOutputDto {
    auctionId: string;
    status: AuctionStatus;
}
