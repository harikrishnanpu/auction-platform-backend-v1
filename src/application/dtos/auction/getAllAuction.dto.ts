import { IAuctionCategoryDto, IAuctionDto } from './auction.dto';

export interface GetAllAuctionCategoryDto {
  categories: IAuctionCategoryDto[];
}

export interface IGetAllAuctionsInputDto {
  userId: string;
}

export interface IGetAllAuctionsOutputDto {
  auctions: IAuctionDto[];
}
