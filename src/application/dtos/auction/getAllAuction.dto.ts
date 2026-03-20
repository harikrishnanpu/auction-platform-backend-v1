import {
  AuctionStatus,
  AuctionType,
} from '@domain/entities/auction/auction.entity';
import { IAuctionCategoryDto, IAuctionDto } from './auction.dto';

export interface GetAllAuctionCategoryDto {
  categories: IAuctionCategoryDto[];
}

export interface IGetAllAuctionsInputDto {
  userId: string;
  status: AuctionStatus | 'ALL';
  auctionType: AuctionType | 'ALL';
  categoryId: string | 'ALL';
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search: string;
}

export interface IGetAllAuctionsOutputDto {
  auctions: IAuctionDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  currentPage: number;
}
