import {
  IUpdateAuctionCategoryInputDto,
  IUpdateAuctionCategoryOutputDto,
} from '@application/dtos/admin/updateAuctionCategory.dto';
import { Result } from '@domain/shared/result';

export interface IUpdateAuctionCategoryUsecase {
  execute(
    data: IUpdateAuctionCategoryInputDto,
  ): Promise<Result<IUpdateAuctionCategoryOutputDto>>;
}
