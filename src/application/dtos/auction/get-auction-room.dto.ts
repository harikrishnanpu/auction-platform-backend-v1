export interface IGetAuctionRoomInput {
  auctionId: string;
  /** When set and matches auction seller, status checks are skipped (seller can view room in any state). */
  sellerId?: string;
}

export interface IAuctionRoomBidDto {
  id: string;
  auctionId: string;
  userId: string;
  amount: number;
  createdAt: string;
}

export interface IAuctionRoomParticipantDto {
  id: string;
  auctionId: string;
  userId: string;
  userName: string;
  joinedAt: string;
}

export interface IGetAuctionRoomOutput {
  bids: IAuctionRoomBidDto[];
  participants: IAuctionRoomParticipantDto[];
  lastBidTime: string | null;
}
