import { IAuctionDto } from './auction.dto';

export type AuctionRoomMode = 'SELLER' | 'USER' | 'ADMIN';

export interface IAuctionRoomBidDto {
  id: string;
  auctionId: string;
  userId: string;
  amount: number;
  createdAt: string;
}

export interface IAuctionRoomSnapshotDto {
  auction: IAuctionDto;
  currentBid: IAuctionRoomBidDto | null;
  liveFeed: IAuctionRoomBidDto[];
  participants: IAuctionRoomParticipantDto[];
}

export interface IAuctionRoomParticipantDto {
  id: string;
  auctionId: string;
  userId: string;
  userName: string;
  joinedAt: string;
}

export interface IGetAuctionRoomInputDto {
  userId: string;
  auctionId: string;
  mode: AuctionRoomMode;
}
