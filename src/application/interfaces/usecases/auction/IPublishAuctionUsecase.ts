import { IPublishAuctionOutput } from '@application/dtos/auction/publish-auction.dto';
import { Result } from '@domain/shared/result';
import { ZodPublishAuctionParamsInputType } from '@presentation/validators/schemas/auction/publishAuctionParams.schema';

export interface IPublishAuctionUsecase {
    execute(
        input: ZodPublishAuctionParamsInputType,
    ): Promise<Result<IPublishAuctionOutput>>;
}
