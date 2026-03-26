import {
    AuctionStatus,
    AuctionType,
} from '@domain/entities/auction/auction.entity';
import { IAuctionDto } from './auction.dto';

export interface IGetUserParticipatedAuctionsInputDto {
    userId: string;
    page: number;
    limit: number;
    search: string;
    auctionType: AuctionType | 'ALL';
    status: AuctionStatus | 'ALL';
    sort: string;
    order: 'asc' | 'desc';
}

export interface IGetUserParticipatedAuctionsOutputDto {
    auctions: IAuctionDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    currentPage: number;
}
