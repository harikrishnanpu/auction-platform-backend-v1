import { AuctionType } from '@domain/entities/auction/auction.entity';
import { AuctionAssetType } from '@domain/entities/auction/auction-asset.entity';

export interface ICreateAuctionInputDto {
  userId: string;
  auctionType: AuctionType;
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
  assets?: {
    fileKey: string;
    position?: number;
    assetType?: AuctionAssetType;
  }[];
}
