import { IGetUserHomeAuctionFeedOutputDto } from '@application/dtos/auction/getUserHomeAuctionFeed.dto';
import { Result } from '@domain/shared/result';

export interface IValidatedGetUserHomeAuctionFeedInput {
    liveLimit: number;
    longSealedLimit: number;
}

export interface IGetUserHomeAuctionFeedUsecase {
    execute(
        input: IValidatedGetUserHomeAuctionFeedInput,
    ): Promise<Result<IGetUserHomeAuctionFeedOutputDto>>;
}
