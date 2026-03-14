export interface IPlaceBidInput {
  auctionId: string;
  userId: string;
  userName: string;
  amount: number;
}

export interface IPlaceBidOutput {
  id: string;
  auctionId: string;
  userId: string;
  amount: number;
  createdAt: string;
}
