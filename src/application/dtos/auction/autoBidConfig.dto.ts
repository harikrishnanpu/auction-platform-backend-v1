import { AutoBidStrategy } from '@domain/entities/auction/auto-bid-config.entity';

export interface ICreateAutoBidConfigInputDto {
    auctionId: string;
    userId: string;
    userName: string;
    strategy: AutoBidStrategy;
    maxBidAmount: number;
}

export interface IUpdateAutoBidConfigInputDto {
    auctionId: string;
    userId: string;
    strategy: AutoBidStrategy;
    maxBidAmount: number;
}

export interface IDisableAutoBidConfigInputDto {
    auctionId: string;
    userId: string;
}

export interface IGetUserAutoBidConfigInputDto {
    auctionId: string;
    userId: string;
}

export interface IAutoBidConfigOutputDto {
    id: string;
    strategy: AutoBidStrategy;
    maxBidAmount: number;
    isActive: boolean;
}
