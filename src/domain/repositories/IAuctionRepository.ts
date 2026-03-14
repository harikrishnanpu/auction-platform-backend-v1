import { Auction, AuctionType } from '@domain/entities/auction/auction.entity';
import { Result } from '@domain/shared/result';

export interface IFindForBrowseFilters {
  category?: string;
  auctionType?: AuctionType;
}

export interface IAuctionRepository {
  save(auction: Auction): Promise<Result<Auction>>;
  update(auction: Auction): Promise<Result<Auction>>;
  findById(id: string): Promise<Result<Auction>>;
  findBySellerId(sellerId: string): Promise<Result<Auction[]>>;
  findForBrowse(filters: IFindForBrowseFilters): Promise<Result<Auction[]>>;
}
