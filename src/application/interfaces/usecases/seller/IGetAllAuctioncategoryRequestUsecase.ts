import {
  IGetAllAuctionCategoryRequestInputDto,
  IGetAllAuctionCategoryRequestOutputDto,
} from '@application/dtos/seller/getAllAuctionCategoryRequest.dto';
import { Result } from '@domain/shared/result';

export interface IGetAllSellerAuctionCategoryRequestUsecase {
  execute(
    input: IGetAllAuctionCategoryRequestInputDto,
  ): Promise<Result<IGetAllAuctionCategoryRequestOutputDto>>;
}
