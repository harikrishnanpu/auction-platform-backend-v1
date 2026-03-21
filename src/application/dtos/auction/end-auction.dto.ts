export interface IEndAuctionInput {
  auctionId: string;
  userId: string;
  isAdmin?: boolean;
}

export interface IEndAuctionOutput {
  id: string;
  status: string;
}
