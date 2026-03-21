import { AuctionCategoryStatus } from '@domain/entities/auction/auction-category.entity';

export interface IRejectAuctionCategoryrequestInputDto {
  categoryId: string;
  reason: string;
}

export interface IRejectAuctionCategoryrequestOutputDto {
  categoryId: string;
  status: AuctionCategoryStatus;
}
