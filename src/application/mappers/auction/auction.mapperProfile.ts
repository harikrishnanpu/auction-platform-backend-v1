import { ICreateAuctionInputDto } from '@application/dtos/auction/create-auction.dto';
import {
  IRequestAuctionCategoryInputDto,
  IRequestAuctionCategoryOutputDto,
} from '@application/dtos/admin/request-auction-category.dto';
import { AuctionCategory } from '@domain/entities/auction/auction-category.entity';
import { Auction, AuctionType } from '@domain/entities/auction/auction.entity';
import { ZodCreateAuctionInputType } from '@presentation/validators/schemas/auction/createAuction.schema';
import { ZodRequestAuctionCategoryInputType } from '@presentation/validators/schemas/seller/requestAuctionCategory.schema';
import {
  IApproveAuctionCategoryInputDto,
  IApproveAuctionCategoryOutputDto,
} from '@application/dtos/admin/approveAuctionCategory.dto';
import { ZodApproveAuctionCategoryInputType } from '@presentation/validators/schemas/admin/approveAuctionCategory.schema';
import {
  GetAllAuctionCategoryDto,
  IGetAllAuctionsInputDto,
} from '@application/dtos/auction/getAllAuction.dto';
import {
  IUpdateAuctionCategoryInputDto,
  IUpdateAuctionCategoryOutputDto,
} from '@application/dtos/admin/updateAuctionCategory.dto';
import { ZodUpdateAuctionCategoryInputType } from '@presentation/validators/schemas/admin/updateAuctionCategory.schema';
import {
  IRejectAuctionCategoryrequestInputDto,
  IRejectAuctionCategoryrequestOutputDto,
} from '@application/dtos/admin/rejectAuctionCategory.dto';
import {
  IAuctionCategoryDto,
  IAuctionDto,
} from '@application/dtos/auction/auction.dto';
import { ZodGetBrowseAuctionsInputType } from '@presentation/validators/schemas/auction/getBrowseAuctions.schema';
import { IGetAuctionByIdInputDto } from '@application/dtos/auction/getAuctionById.dto';
import { ZodGenerateAuctionUploadUrlInputType } from '@presentation/validators/schemas/auction/generateAuctionUploadUrl.schema';
import { IGenerateAuctionUploadUrlInput } from '@application/dtos/auction/generate-auction-upload-url.dto';
import { ZodUpdateAuctionInputType } from '@presentation/validators/schemas/auction/updateAuction.schema';
import { IUpdateAuctionInput } from '@application/dtos/auction/update-auction.dto';
import { ZodPublishAuctionParamsInputType } from '@presentation/validators/schemas/auction/publishAuctionParams.schema';
import { IPublishAuctionInput } from '@application/dtos/auction/publish-auction.dto';
import { IEndAuctionInput } from '@application/dtos/auction/end-auction.dto';

export class AuctionMapperProrfile {
  public static toCreateAuctionDto(
    data: ZodCreateAuctionInputType,
    userId: string,
  ): ICreateAuctionInputDto {
    return {
      userId,
      auctionType: data.auctionType as AuctionType,
      title: data.title,
      description: data.description,
      categoryId: data.categoryId,
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

  public static toAuctionOutputDto(data: Auction): IAuctionDto {
    return {
      id: data.getId(),
      sellerId: data.getSellerId(),
      auctionType: data.getAuctionType(),
      title: data.getTitle(),
      description: data.getDescription(),
      category: {
        id: data.getCategory().getId(),
        name: data.getCategory().getName(),
        slug: data.getCategory().getSlug().getValue(),
        parentId: data.getCategory().getParentId(),
        isVerified: data.getCategory().getIsVerified(),
        isActive: data.getCategory().getIsActive(),
        status: data.getCategory().getStatus(),
        submittedBy: data.getCategory().getSubmittedBy(),
        rejectionReason: data.getCategory().getRejectionReason(),
      } as IAuctionCategoryDto,
      condition: data.getCondition(),
      startPrice: data.getStartPrice(),
      minIncrement: data.getMinIncrement(),
      startAt: data.getStartAt(),
      endAt: data.getEndAt(),
      antiSnipSeconds: data.getAntiSnipSeconds(),
      maxExtensionCount: data.getMaxExtensionCount(),
      bidCooldownSeconds: data.getBidCooldownSeconds(),
      status: data.getStatus(),
      assets: data.getAssets().map((a) => ({
        id: a.getId(),
        fileKey: a.getFileKey(),
        position: a.getPosition(),
        assetType: a.getAssetType(),
      })),
    };
  }

  public static toRequestAuctionCategoryDto(
    data: ZodRequestAuctionCategoryInputType,
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
        submittedBy: category.getSubmittedBy(),
        rejectionReason: category.getRejectionReason(),
      })),
    };
  }

  public static toApproveAuctionCategoryInputDto(
    data: ZodApproveAuctionCategoryInputType,
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

  public static toRejectAuctionCategoryInputDto(
    data: IRejectAuctionCategoryrequestInputDto,
  ): IRejectAuctionCategoryrequestInputDto {
    return {
      categoryId: data.categoryId.trim(),
      reason: data.reason,
    };
  }

  public static toUpdateAuctionCategoryInputDto(
    data: ZodUpdateAuctionCategoryInputType,
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

  public static toRejectAuctionCategoryResponseDto(
    data: AuctionCategory,
  ): IRejectAuctionCategoryrequestOutputDto {
    return {
      categoryId: data.getId(),
      status: data.getStatus(),
    };
  }

  public static toGetBrowseAuctionsDto(
    data: ZodGetBrowseAuctionsInputType,
    userId: string,
  ): IGetAllAuctionsInputDto {
    return {
      userId: userId,
      status: 'ALL',
      auctionType: 'ALL',
      categoryId: 'ALL',
      page: data.page,
      limit: data.limit,
      sort: data.sort,
      order: data.order,
      search: data.search,
    };
  }

  public static toGetAuctionByIdDto(
    auctionId: string,
    userId: string,
  ): IGetAuctionByIdInputDto {
    return {
      auctionId,
      userId,
    };
  }

  public static toGenerateAuctionUploadUrlDto(
    data: ZodGenerateAuctionUploadUrlInputType,
    userId: string,
  ): IGenerateAuctionUploadUrlInput {
    return {
      userId,
      fileName: data.fileName,
      contentType: data.contentType,
      fileSize: data.fileSize,
    };
  }

  public static toUpdateAuctionInputDto(
    data: ZodUpdateAuctionInputType,
    userId: string,
    auctionId: string,
  ): IUpdateAuctionInput {
    return {
      userId: userId,
      auctionId: auctionId,
      auctionType: data.auctionType as AuctionType | undefined,
      title: data.title,
      description: data.description,
      category: data.category,
      condition: data.condition,
      startPrice: data.startPrice,
      minIncrement: data.minIncrement,
      startAt: new Date(data.startAt),
      endAt: new Date(data.endAt),
      antiSnipSeconds: data.antiSnipSeconds,
      maxExtensionCount: data.maxExtensionCount,
      bidCooldownSeconds: data.bidCooldownSeconds,
      assets: data.assets?.map((a) => {
        return {
          fileKey: a.fileKey,
          position: a.position,
          assetType: a.assetType,
        };
      }),
    };
  }

  public static toPublishAuctionInputDto(
    data: ZodPublishAuctionParamsInputType,
    userId: string,
  ): IPublishAuctionInput {
    return {
      auctionId: data.id,
      userId: userId,
    };
  }

  public static toEndAuctionInputDto(
    auctionId: string,
    userId: string,
    isAdmin: boolean,
  ): IEndAuctionInput {
    return {
      auctionId: auctionId,
      userId: userId,
      isAdmin: isAdmin,
    };
  }
}
