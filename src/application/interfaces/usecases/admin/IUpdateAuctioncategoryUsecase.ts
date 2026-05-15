import { IUpdateAuctionCategoryOutputDto } from '@application/dtos/admin/updateAuctionCategory.dto';
import { Result } from '@domain/shared/result';
export interface IValidatedUpdateAuctionCategoryInput {
    categoryId: string;
    name: string;
    parentId: string | undefined;
}

export interface IUpdateAuctionCategoryUsecase {
    execute(
        data: IValidatedUpdateAuctionCategoryInput,
    ): Promise<Result<IUpdateAuctionCategoryOutputDto>>;
}
