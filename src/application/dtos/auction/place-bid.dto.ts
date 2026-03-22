export interface IPlaceBidInput {
  auctionId: string;
  userId: string;
  userName: string;
  amount: string;
}

export interface IPlaceBidOutput {
  id: string;
  auctionId: string;
  userId: string;
  amount: string;
  createdAt: string;
  endAt: string;
  extensionCount: number;
}
