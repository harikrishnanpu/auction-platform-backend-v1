import { IGetAllAdminAuctionCategoryResponseDto } from '@application/dtos/admin/getAllCategoryRequest.dto';
import { Result } from '@domain/shared/result';

export interface IGetAllCategoryRequestUsecase {
  execute(): Promise<Result<IGetAllAdminAuctionCategoryResponseDto>>;
}
