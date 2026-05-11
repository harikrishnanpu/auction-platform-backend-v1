import type { AuctionType } from '@domain/entities/auction/auction.entity';

import type { IAuctionDto } from '@application/dtos/auction/auction.dto';
import type { Result } from '@domain/shared/result';

export interface IValidatedGetAdminAuctionsInput {
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

export interface IGetAdminAuctionsInputDto {
    auctionType: AuctionType | 'ALL';
    categoryId: string | 'ALL';
    page: number;
    limit: number;
    sort: string;
    order: 'asc' | 'desc';
    search: string;
}

export interface IGetAdminAuctionsOutputDto {
    auctions: IAuctionDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    currentPage: number;
}

export interface IGetAdminAuctionsUsecase {
    execute(
        input: IValidatedGetAdminAuctionsInput,
    ): Promise<Result<IGetAdminAuctionsOutputDto>>;
}
