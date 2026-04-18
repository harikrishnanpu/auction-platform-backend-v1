import { ICreateAuctionCategoryOutputDto } from '@application/dtos/admin/createAuctionCategory.dto';
import { Result } from '@domain/shared/result';
import { ZodCreateAuctionCategoryInputType } from '@presentation/validators/schemas/admin/createAuctionCategory.schema';

export interface ICreateAuctionCategoryUsecase {
    execute(
        data: ZodCreateAuctionCategoryInputType,
    ): Promise<Result<ICreateAuctionCategoryOutputDto>>;
}
