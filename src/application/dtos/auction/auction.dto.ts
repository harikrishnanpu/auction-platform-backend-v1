import { AuctionAssetType } from '@domain/entities/auction/auction-asset.entity';
import { AuctionCategoryStatus } from '@domain/entities/auction/auction-category.entity';
import {
  AuctionStatus,
  AuctionType,
} from '@domain/entities/auction/auction.entity';

export interface IAuctionCategoryDto {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  isVerified: boolean;
  isActive: boolean;
  status: AuctionCategoryStatus;
  submittedBy: string;
  rejectionReason?: string | null;
}

export interface IAuctionAssetDto {
  id: string;
  fileKey: string;
  position: number;
  assetType: AuctionAssetType;
}

export interface IAuctionDto {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  categoryId: string;
  condition: string;
  startPrice: number;
  minIncrement: number;
  startAt: Date;
  endAt: Date;
  antiSnipSeconds: number;
  maxExtensionCount: number;
  bidCooldownSeconds: number;
  status: AuctionStatus;
  auctionType: AuctionType;
  assets: IAuctionAssetDto[];
}
