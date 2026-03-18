import { AuctionCategoryStatus } from '@domain/entities/auction/auction-category.entity';

export interface IApproveAuctionCategoryInputDto {
  categoryId: string;
}

export interface IApproveAuctionCategoryOutputDto {
  categoryId: string;
  status: AuctionCategoryStatus;
}
