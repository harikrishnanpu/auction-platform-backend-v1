import { IGetUserParticipatedAuctionsOutputDto } from '@application/dtos/auction/get-user-participated-auctions.dto';
import { Result } from '@domain/shared/result';

export interface IValidatedGetUserParticipatedAuctionsInput {
    userId: string;
    page: number;
    limit: number;
    search?: string;
    auctionType?: string;
    status?: string;
    sort?: string;
    order?: 'asc' | 'desc';
}

export interface IGetUserParticipatedAuctionsUsecase {
    execute(
        input: IValidatedGetUserParticipatedAuctionsInput,
    ): Promise<Result<IGetUserParticipatedAuctionsOutputDto>>;
}
