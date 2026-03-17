import { GetAllAuctionDto } from '@application/dtos/auction/getAllAuction.dto';
import { Result } from '@domain/shared/result';

export interface IGetAllAuctionCategoriesUsecase {
  execute(): Promise<Result<GetAllAuctionDto>>;
}
