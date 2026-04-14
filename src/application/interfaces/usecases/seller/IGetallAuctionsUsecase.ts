import { IGetAllAuctionsOutputDto } from '@application/dtos/auction/getAllAuction.dto';
import { Result } from '@domain/shared/result';
import { ZodGetAllAuctionsInputType } from '@presentation/validators/schemas/seller/getAllAuctions.schema';

export interface IGetAllSellerAuctionsUsecase {
    execute(
        input: ZodGetAllAuctionsInputType,
    ): Promise<Result<IGetAllAuctionsOutputDto>>;
}
