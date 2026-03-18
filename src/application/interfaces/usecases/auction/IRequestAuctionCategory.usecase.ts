import {
  IRequestAuctionCategoryInputDto,
  IRequestAuctionCategoryOutputDto,
} from '@application/dtos/admin/request-auction-category.dto';
import { Result } from '@domain/shared/result';

export interface IRequestAuctionCategoryUsecase {
  execute(
    input: IRequestAuctionCategoryInputDto,
  ): Promise<Result<IRequestAuctionCategoryOutputDto>>;
}
