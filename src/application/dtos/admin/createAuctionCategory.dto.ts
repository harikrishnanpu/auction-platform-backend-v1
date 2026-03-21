export interface ICreateAuctionCategoryInputDto {
  name: string;
  parentId: string | null;
  userId: string;
}

export interface ICreateAuctionCategoryOutputDto {
  categoryId: string;
  name: string;
  parentId: string | null;
}
