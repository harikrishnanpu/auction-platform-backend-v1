import { AuctionCategoryStatus } from '@domain/entities/auction/auction-category.entity';

export interface IAuctionCategoryDto {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  isVerified: boolean;
  isActive: boolean;
  status: AuctionCategoryStatus;
}
