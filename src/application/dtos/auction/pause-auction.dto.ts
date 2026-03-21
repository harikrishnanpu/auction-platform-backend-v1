export interface IPauseAuctionInput {
  auctionId: string;
  userId: string;
  isAdmin?: boolean;
}

export interface IPauseAuctionOutput {
  id: string;
  status: string;
}
