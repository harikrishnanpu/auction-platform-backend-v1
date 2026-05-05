import type { AuctionType } from '@domain/entities/auction/auction.entity';
import { Result } from '@domain/shared/result';

import type { IAuctionDto } from '@application/dtos/auction/auction.dto';

export interface IValidatedGetBrowseAuctionsInput {
    userId: string;
    auctionType: string;
    categoryId: string;
    page: number;
    limit: number;
    sort: string;
    order: 'asc' | 'desc';
    search: string;
    scope: 'default' | 'ending_soon';
}

export interface IGetBrowseAuctionsInputDto {
    auctionType: AuctionType | 'ALL';
    categoryId: string | 'ALL';
    page: number;
    limit: number;
    sort: string;
    order: 'asc' | 'desc';
    search: string;
}

export interface IGetBrowseAuctionsOutputDto {
    auctions: IAuctionDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    currentPage: number;
}

export interface IGetBrowseAuctionsUsecase {
    execute(
        data: IValidatedGetBrowseAuctionsInput,
    ): Promise<Result<IGetBrowseAuctionsOutputDto>>;
}
