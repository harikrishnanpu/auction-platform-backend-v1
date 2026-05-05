import { IGetAllAuctionsOutputDto } from '@application/dtos/auction/getAllAuction.dto';
import { Result } from '@domain/shared/result';
export interface IValidatedGetAllSellerAuctionsInput {
    userId: string;
    status?: string;
    auctionType?: string;
    categoryId?: string;
    page?: string;
    limit?: string;
    sort?: 'startAt' | 'endAt' | 'startPrice' | 'createdAt';
    order?: 'asc' | 'desc';
    search?: string;
}

export interface IGetAllSellerAuctionsUsecase {
    execute(
        input: IValidatedGetAllSellerAuctionsInput,
    ): Promise<Result<IGetAllAuctionsOutputDto>>;
}
