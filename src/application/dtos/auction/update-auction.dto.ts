import { AuctionType } from '@domain/entities/auction/auction.entity';

export interface IUpdateAuctionInput {
  auctionId: string;
  userId: string;
  auctionType?: AuctionType;
  title: string;
  description: string;
  category: string;
  condition: string;
  startPrice: number;
  minIncrement: number;
  startAt: Date;
  endAt: Date;
  antiSnipSeconds?: number;
  maxExtensionCount?: number;
  bidCooldownSeconds?: number;
}

export interface IUpdateAuctionOutput {
  id: string;
  sellerId: string;
  auctionType: AuctionType;
  title: string;
  description: string;
  category: string;
  condition: string;
  startPrice: number;
  minIncrement: number;
  startAt: string;
  endAt: string;
  status: string;
  antiSnipSeconds: number;
  extensionCount: number;
  maxExtensionCount: number;
  bidCooldownSeconds: number;
  winnerId: string | null;
}
