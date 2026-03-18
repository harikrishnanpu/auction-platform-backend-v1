import { ICreateAuctionInputDto } from '@application/dtos/auction/create-auction.dto';
import {
  IRequestAuctionCategoryInputDto,
  IRequestAuctionCategoryOutputDto,
} from '@application/dtos/admin/request-auction-category.dto';
import { AuctionCategory } from '@domain/entities/auction/auction-category.entity';
import { AuctionType } from '@domain/entities/auction/auction.entity';
import { CreateAuctionInput } from '@presentation/validators/schemas/auction/createAuction.schema';
import { RequestAuctionCategoryInput } from '@presentation/validators/schemas/auction/requestAuctionCategory.schema';
import {
  IApproveAuctionCategoryInputDto,
  IApproveAuctionCategoryOutputDto,
} from '@application/dtos/admin/approveAuctionCategory.dto';
import { ApproveAuctionCategoryInput } from '@presentation/validators/schemas/admin/approveAuctionCategory.schema';
import { GetAllAuctionCategoryDto } from '@application/dtos/auction/getAllAuction.dto';
import {
  IUpdateAuctionCategoryInputDto,
  IUpdateAuctionCategoryOutputDto,
} from '@application/dtos/admin/updateAuctionCategory.dto';
import { UpdateAuctionCategoryInput } from '@presentation/validators/schemas/admin/updateAuctionCategory.schema';

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
      status: data.getStatus(),
      parentId: data.getParentId() || null,
    };
  }

  public static toGetAllAuctionCategoryResponseDto(
    data: AuctionCategory[],
  ): GetAllAuctionCategoryDto {
    return {
      categories: data.map((category) => ({
        id: category.getId(),
        name: category.getName(),
        slug: category.getSlug().getValue(),
        parentId: category.getParentId(),
        isVerified: category.getIsVerified(),
        isActive: category.getIsActive(),
        status: category.getStatus(),
      })),
    };
  }

  public static toApproveAuctionCategoryInputDto(
    data: ApproveAuctionCategoryInput,
  ): IApproveAuctionCategoryInputDto {
    return {
      categoryId: data.categoryId.trim(),
    };
  }

  public static toApproveAuctionCategoryOutputDto(
    data: AuctionCategory,
  ): IApproveAuctionCategoryOutputDto {
    return {
      categoryId: data.getId(),
      status: data.getStatus(),
    };
  }

  public static toUpdateAuctionCategoryInputDto(
    data: UpdateAuctionCategoryInput,
  ): IUpdateAuctionCategoryInputDto {
    return {
      categoryId: data.categoryId.trim(),
      name: data.name,
      parentId: data.parentId || null,
    };
  }

  public static toUpdateAuctionCategoryResponseDto(
    data: AuctionCategory,
  ): IUpdateAuctionCategoryOutputDto {
    return {
      categoryId: data.getId(),
      name: data.getName(),
      parentId: data.getParentId() || null,
    };
  }
}
