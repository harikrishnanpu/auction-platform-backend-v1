import { IUpdateAuctionCategoryOutputDto } from '@application/dtos/admin/updateAuctionCategory.dto';
import { Result } from '@domain/shared/result';
import { ZodUpdateAuctionCategoryInputType } from '@presentation/validators/schemas/admin/updateAuctionCategory.schema';

export interface IUpdateAuctionCategoryUsecase {
    execute(
        data: ZodUpdateAuctionCategoryInputType,
    ): Promise<Result<IUpdateAuctionCategoryOutputDto>>;
}
