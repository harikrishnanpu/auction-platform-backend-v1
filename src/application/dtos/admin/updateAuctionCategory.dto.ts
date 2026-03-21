export interface IUpdateAuctionCategoryInputDto {
  categoryId: string;
  name: string;
  parentId: string | null;
}

export interface IUpdateAuctionCategoryOutputDto {
  categoryId: string;
  name: string;
  parentId: string | null;
}
