import { IRejectAuctionCategoryrequestOutputDto } from '@application/dtos/admin/rejectAuctionCategory.dto';
import { Result } from '@domain/shared/result';
import { ZodRejectAuctionCategoryInputType } from '@presentation/validators/schemas/admin/rejectAuctionCategory.schema';

export interface IRejectAuctionCategoryrequestUsecase {
    execute(
        data: ZodRejectAuctionCategoryInputType,
    ): Promise<Result<IRejectAuctionCategoryrequestOutputDto>>;
}
