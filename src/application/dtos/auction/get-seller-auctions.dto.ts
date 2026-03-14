import {
  AuctionStatus,
  AuctionType,
} from '@domain/entities/auction/auction.entity';

export interface IAuctionAssetDto {
  id: string;
  fileKey: string;
  position: number;
  assetType: string;
}

export interface IAuctionListItemDto {
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
  status: AuctionStatus;
  assetCount: number;
  primaryImageKey?: string;
  antiSnipSeconds: number;
  extensionCount: number;
  maxExtensionCount: number;
  bidCooldownSeconds: number;
  winnerId: string | null;
}

export interface IGetSellerAuctionsInput {
  sellerId: string;
}

export interface IGetSellerAuctionsOutput {
  auctions: IAuctionListItemDto[];
}
