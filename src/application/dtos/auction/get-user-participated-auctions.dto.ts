import {
    AuctionStatus,
    AuctionType,
} from '@domain/entities/auction/auction.entity';
import { IAuctionDto } from './auction.dto';

export interface IUserAuctionParticipationDto {
    outcome: string;
    label: string;
}

export interface IUserParticipatedAuctionDto extends IAuctionDto {
    participation: IUserAuctionParticipationDto;
}

export interface IGetUserParticipatedAuctionsInputDto {
    userId: string;
    query: {
        page: number;
        limit: number;
        search: string;
        auctionType: AuctionType | 'ALL';
        status: AuctionStatus | 'ALL';
        sort: string;
        order: 'asc' | 'desc';
    };
}

export interface IGetUserParticipatedAuctionsOutputDto {
    auctions: IUserParticipatedAuctionDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    currentPage: number;
}
