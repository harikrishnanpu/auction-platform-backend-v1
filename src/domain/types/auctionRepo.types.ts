import {
  AuctionStatus,
  AuctionType,
} from '@domain/entities/auction/auction.entity';

export interface IFindAllAuctionsFilters {
  categoryId?: string;
  auctionType?: AuctionType | 'ALL';
  status?: AuctionStatus | 'ALL';
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  sellerId?: string;
}
