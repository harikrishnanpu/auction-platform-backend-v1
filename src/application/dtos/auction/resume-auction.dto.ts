export interface IResumeAuctionInput {
  auctionId: string;
  userId: string;
  isAdmin?: boolean;
}

export interface IResumeAuctionOutput {
  id: string;
  status: string;
}
