import { IRejectAuctionCategoryrequestOutputDto } from '@application/dtos/admin/rejectAuctionCategory.dto';
import { Result } from '@domain/shared/result';
export interface IValidatedRejectAuctionCategoryrequestInput {
    categoryId: string;
    reason: string;
}

export interface IRejectAuctionCategoryrequestUsecase {
    execute(
        data: IValidatedRejectAuctionCategoryrequestInput,
    ): Promise<Result<IRejectAuctionCategoryrequestOutputDto>>;
}
