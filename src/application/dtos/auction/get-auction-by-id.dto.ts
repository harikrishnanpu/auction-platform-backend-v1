import {
  AuctionStatus,
  AuctionType,
} from '@domain/entities/auction/auction.entity';

export interface IAuctionAssetDto {
  id: string;
  auctionId: string;
  fileKey: string;
  position: number;
  assetType: string;
}

export interface IGetAuctionByIdOutput {
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
  assets: IAuctionAssetDto[];
  antiSnipSeconds: number;
  extensionCount: number;
  maxExtensionCount: number;
  bidCooldownSeconds: number;
  winnerId: string | null;
}

export interface IGetAuctionByIdInput {
  auctionId: string;
  userId?: string;
}
