import { IRequestAuctionCategoryInputDto } from '@application/dtos/admin/request-auction-category.dto';
import { IGetAllAuctionsInputDto } from '@application/dtos/auction/getAllAuction.dto';
import { IGetAuctionByIdInputDto } from '@application/dtos/auction/getAuctionById.dto';
import { IGetAllAuctionCategoryRequestInputDto } from '@application/dtos/seller/getAllAuctionCategoryRequest.dto';
import {
  AuctionStatus,
  AuctionType,
} from '@domain/entities/auction/auction.entity';
import { ZodGetAllAuctionsInputType } from '@presentation/validators/schemas/seller/getAllAuctions.schema';
import { ZodRequestAuctionCategoryInputType } from '@presentation/validators/schemas/seller/requestAuctionCategory.schema';

export class SellerMapperProfile {
  public static toGetAllAuctionCategoryRequestInputDto(
    userId: string,
  ): IGetAllAuctionCategoryRequestInputDto {
    return {
      userId,
    };
  }

  public static toRequestAuctionCategoryInputDto(
    data: ZodRequestAuctionCategoryInputType,
    userId: string,
  ): IRequestAuctionCategoryInputDto {
    return {
      userId,
      name: data.name,
      parentId: data.parentId || null,
    };
  }

  public static toGetAllAuctionsInputDto(
    data: ZodGetAllAuctionsInputType,
    userId: string,
  ): IGetAllAuctionsInputDto {
    return {
      userId,
      status: data.status as AuctionStatus | 'ALL',
      auctionType: data.auctionType as AuctionType | 'ALL',
      categoryId: data.categoryId as string | 'ALL',
      page: parseInt(data.page ?? '1'),
      limit: parseInt(data.limit ?? '10'),
      sort: data.sort as string,
      order: data.order as 'asc' | 'desc',
      search: data.search ?? '',
    };
  }

  public static toGetAuctionByIdInputDto(
    auctionId: string,
    userId: string,
  ): IGetAuctionByIdInputDto {
    return {
      auctionId,
      userId,
    };
  }
}
