import { AuctionType } from '@domain/entities/auction/auction.entity';
import { AuctionAssetType } from '@domain/entities/auction/auction-asset.entity';
import { IAuctionDto } from './auction.dto';

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
  assets?: {
    fileKey: string;
    position?: number;
    assetType?: AuctionAssetType;
  }[];
}

export interface IUpdateAuctionOutput {
  auction: IAuctionDto;
}
