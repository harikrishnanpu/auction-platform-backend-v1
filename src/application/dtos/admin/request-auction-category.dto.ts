import { AuctionCategoryStatus } from '@domain/entities/auction/auction-category.entity';

export interface IRequestAuctionCategoryInputDto {
  userId: string;
  name: string;
  parentId: string | null;
}

export interface IRequestAuctionCategoryOutputDto {
  name: string;
  slug: string;
  isVerified: boolean;
  status: AuctionCategoryStatus;
  parentId: string | null;
}
