import { IGetAllAdminAuctionCategoryResponseDto } from '@application/dtos/admin/getAllCategoryRequest.dto';
import { Result } from '@domain/shared/result';

export interface IGetAllAdminAuctionCategoriesUsecase {
  execute(): Promise<Result<IGetAllAdminAuctionCategoryResponseDto>>;
}
