import { IAuctionCategoryDto } from '../auction/auction.dto';

export interface IGetAllAuctionCategoryRequestInputDto {
  userId: string;
}

export interface IGetAllAuctionCategoryRequestOutputDto {
  categories: IAuctionCategoryDto[];
}
