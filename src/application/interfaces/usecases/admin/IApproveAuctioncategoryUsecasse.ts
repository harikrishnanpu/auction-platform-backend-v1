import {
  IApproveAuctionCategoryInputDto,
  IApproveAuctionCategoryOutputDto,
} from '@application/dtos/admin/approveAuctionCategory.dto';
import { Result } from '@domain/shared/result';

export interface IApproveAuctionCategoryUsecase {
  execute(
    data: IApproveAuctionCategoryInputDto,
  ): Promise<Result<IApproveAuctionCategoryOutputDto>>;
}
