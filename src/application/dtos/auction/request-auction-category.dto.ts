export interface IRequestAuctionCategoryInputDto {
  userId: string;
  name: string;
  slug: string;
  parentId: string | null;
}

export interface IRequestAuctionCategoryOutputDto {
  name: string;
  slug: string;
  isVerified: boolean;
}
