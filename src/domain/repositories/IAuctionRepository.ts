import { Auction } from '@domain/entities/auction/auction.entity';
import { Result } from '@domain/shared/result';
import { IFindAllAuctionsFilters } from '@domain/types/auctionRepo.types';

export interface IAuctionRepository {
  save(auction: Auction): Promise<Result<Auction>>;
  findById(id: string): Promise<Result<Auction>>;
  findBySellerId(sellerId: string): Promise<Result<Auction[]>>;
  findAll(filters: IFindAllAuctionsFilters): Promise<Result<Auction[]>>;
}
