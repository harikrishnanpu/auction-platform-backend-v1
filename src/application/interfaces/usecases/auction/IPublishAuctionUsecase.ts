import { IPublishAuctionOutput } from '@application/dtos/auction/publish-auction.dto';
import { Result } from '@domain/shared/result';
export interface IValidatedPublishAuctionInput {
    id: string;
    userId: string;
}

export interface IPublishAuctionUsecase {
    execute(
        input: IValidatedPublishAuctionInput,
    ): Promise<Result<IPublishAuctionOutput>>;
}
