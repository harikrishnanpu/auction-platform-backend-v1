import { ICreateAuctionCategoryOutputDto } from '@application/dtos/admin/createAuctionCategory.dto';
import { Result } from '@domain/shared/result';

export interface IValidatedCreateAuctionCategoryInput {
    name: string;
    parentId: string | undefined;
    userId: string;
}

export interface ICreateAuctionCategoryUsecase {
    execute(
        data: IValidatedCreateAuctionCategoryInput,
    ): Promise<Result<ICreateAuctionCategoryOutputDto>>;
}
