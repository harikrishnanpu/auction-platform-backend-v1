import {
  AuctionStatus,
  AuctionType,
} from '@domain/entities/auction/auction.entity';

export interface IBrowseAuctionListItemDto {
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

export interface IGetBrowseAuctionsInput {
  category?: string;
  auctionType?: AuctionType | 'ALL';
}

export interface IGetBrowseAuctionsOutput {
  auctions: IBrowseAuctionListItemDto[];
}
