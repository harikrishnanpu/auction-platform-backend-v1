import {
  ICreateAuctionCategoryInputDto,
  ICreateAuctionCategoryOutputDto,
} from '@application/dtos/admin/createAuctionCategory.dto';
import { Result } from '@domain/shared/result';

export interface ICreateAuctionCategoryUsecase {
  execute(
    data: ICreateAuctionCategoryInputDto,
  ): Promise<Result<ICreateAuctionCategoryOutputDto>>;
}
