import { GetAllAuctionCategoryDto } from '@application/dtos/auction/getAllAuction.dto';
import { Result } from '@domain/shared/result';

export interface IGetAllAuctionCategoriesUsecase {
  execute(): Promise<Result<GetAllAuctionCategoryDto>>;
}
