import { IUpdateAuctionOutput } from '@application/dtos/auction/update-auction.dto';
import { Result } from '@domain/shared/result';
import { ZodUpdateAuctionInputType } from '@presentation/validators/schemas/auction/updateAuction.schema';

export interface IUpdateAuctionUsecase {
    execute(
        input: ZodUpdateAuctionInputType,
    ): Promise<Result<IUpdateAuctionOutput>>;
}
