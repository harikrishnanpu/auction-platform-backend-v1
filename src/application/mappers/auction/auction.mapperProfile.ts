import { ICreateAuctionInputDto } from '@application/dtos/auction/create-auction.dto';
import { GetAllAuctionDto } from '@application/dtos/auction/getAllAuction.dto';
import {
  IRequestAuctionCategoryInputDto,
  IRequestAuctionCategoryOutputDto,
} from '@application/dtos/auction/request-auction-category.dto';
import { AuctionCategory } from '@domain/entities/auction/auction-category.entity';
import { AuctionType } from '@domain/entities/auction/auction.entity';
import { CreateAuctionInput } from '@presentation/validators/schemas/auction/createAuction.schema';
import { RequestAuctionCategoryInput } from '@presentation/validators/schemas/auction/requestAuctionCategory.schema';

export class AuctionMapperProrfile {
  public static toCreateAuctionDto(
    data: CreateAuctionInput,
    userId: string,
  ): ICreateAuctionInputDto {
    return {
      userId,
      auctionType: data.auctionType as AuctionType,
      title: data.title,
      description: data.description,
      category: data.category,
      condition: data.condition,
      startPrice: data.startPrice,
      minIncrement: data.minIncrement,
      assets: data.assets.map((a) => {
        return {
          assetType: a.assetType,
          fileKey: a.fileKey,
        };
      }),
      startAt: new Date(data.startAt),
      endAt: new Date(data.endAt),
      antiSnipSeconds: data.antiSnipSeconds,
      maxExtensionCount: data.maxExtensionCount,
      bidCooldownSeconds: data.bidCooldownSeconds,
    };
  }

  public static toRequestAuctionCategoryDto(
    data: RequestAuctionCategoryInput,
    userId: string,
  ): IRequestAuctionCategoryInputDto {
    return {
      userId,
      name: data.name,
      slug: data.name.toLowerCase().replace(/ /g, '-'),
      parentId: data.parentId || null,
    };
  }

  public static toRequestAuctionCategoryResponse(
    data: AuctionCategory,
  ): IRequestAuctionCategoryOutputDto {
    return {
      name: data.getName(),
      slug: data.getSlug().getValue(),
      isVerified: data.getIsVerified(),
    };
  }

  public static toGetAllAuctionResponseDto(
    data: AuctionCategory[],
  ): GetAllAuctionDto {
    return {
      categories: data.map((category) => ({
        id: category.getId(),
        name: category.getName(),
        slug: category.getSlug().getValue(),
        parentId: category.getParentId(),
        isVerified: category.getIsVerified(),
        isActive: category.getIsActive(),
      })),
    };
  }
}
