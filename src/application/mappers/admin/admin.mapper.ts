import { IApproveAuctionCategoryInputDto } from '@application/dtos/admin/approveAuctionCategory.dto';
import { IApproveSellerKycInput } from '@application/dtos/admin/approveSellerKyc.dto';
import { IBlockUserInput } from '@application/dtos/admin/blockuser.dto';
import { IChangeAuctionCategoryStatusInputDto } from '@application/dtos/admin/changeAuctionCategoryStatus.dto';
import { ICreateAuctionCategoryInputDto } from '@application/dtos/admin/createAuctionCategory.dto';
import { IGetAdminSellerInput } from '@application/dtos/admin/getAdminSeller.dto';
import { IGetAllUsersInput } from '@application/dtos/admin/getAllusers.dto';
import { IGetAllSellersInput } from '@application/dtos/admin/getSellers.dto';
import { IGetUserInput } from '@application/dtos/admin/getUser.dto';
import { IRejectAuctionCategoryrequestInputDto } from '@application/dtos/admin/rejectAuctionCategory.dto';
import { IRejectSellerKycInput } from '@application/dtos/admin/rejectSellerKyc.dto';
import { IUpdateAuctionCategoryInputDto } from '@application/dtos/admin/updateAuctionCategory.dto';
import { IViewKycInputDto } from '@application/dtos/admin/viewKyc.dto';
import { UserRoleType } from '@application/dtos/auth/loginUser.dto';
import { IGetAdminAuctionsInputDto } from '@application/interfaces/usecases/admin/IGetAdminAuctionsUsecase';
import { AuctionType } from '@domain/entities/auction/auction.entity';
import {
  AuthProviderType,
  UserStatus,
} from '@domain/entities/user/user.entity';
import { ZodApproveAuctionCategoryInputType } from '@presentation/validators/schemas/admin/approveAuctionCategory.schema';
import { ZodBlockUserInputType } from '@presentation/validators/schemas/admin/blockUsers.schema';
import { ZodChangeAuctionCategoryStatusInputType } from '@presentation/validators/schemas/admin/changeAuctionStaus.schema';
import { ZodCreateAuctionCategoryInputType } from '@presentation/validators/schemas/admin/createAuctionCategory.schema';
import { ZodGetAdminSellerInputType } from '@presentation/validators/schemas/admin/getAdminSeller.schema';
import { ZodGetAdminUserInputType } from '@presentation/validators/schemas/admin/getAdminUser.schema';
import { ZodGetAllUsersInputType } from '@presentation/validators/schemas/admin/getAllUsers.schema';
import { ZodGetAllSellersInputType } from '@presentation/validators/schemas/admin/getSellers.schema';
import { ZodRejectAuctionCategoryInputType } from '@presentation/validators/schemas/admin/rejectAuctionCategory.schema';
import { ZodRejectSellerKycInputType } from '@presentation/validators/schemas/admin/rejectSellerKyc.schema';
import { ZodUpdateAuctionCategoryInputType } from '@presentation/validators/schemas/admin/updateAuctionCategory.schema';
import { ZodViewKycInputType } from '@presentation/validators/schemas/admin/viewKyc.schema';
import { ZodGetBrowseAuctionsInputType } from '@presentation/validators/schemas/auction/getBrowseAuctions.schema';

export class AdminMapperProfile {
  public static toGetAllUsersInputDto(
    data: ZodGetAllUsersInputType,
  ): IGetAllUsersInput {
    return {
      page: data.page ? Number(data.page) : 1,
      limit: data.limit ? Number(data.limit) : 10,
      search: data.search ?? '',
      sort: data.sort ?? 'createdAt',
      order: data.order as 'asc' | 'desc',
      role: data.role as UserRoleType | 'ALL',
      status: data.status as UserStatus | 'ALL',
      authProvider: data.authProvider as AuthProviderType | 'ALL',
    };
  }

  public static toBlockUserInputDto(
    data: ZodBlockUserInputType,
  ): IBlockUserInput {
    return {
      userId: data.userId,
      block: data.block,
    };
  }

  public static toGetAdminUserInputDto(
    data: ZodGetAdminUserInputType,
  ): IGetUserInput {
    return {
      userId: data.userId,
    };
  }

  public static toGetAllSellersInputDto(
    data: ZodGetAllSellersInputType,
  ): IGetAllSellersInput {
    return {
      page: data.page ? Number(data.page) : 1,
      limit: data.limit ? Number(data.limit) : 10,
      pendingOnly: data.pendingOnly ?? false,
    };
  }

  public static toGetAdminSellerInputDto(
    data: ZodGetAdminSellerInputType,
  ): IGetAdminSellerInput {
    return {
      sellerId: data.id,
    };
  }

  public static toApproveSellerKycInputDto(
    data: ZodGetAdminSellerInputType,
  ): IApproveSellerKycInput {
    return {
      sellerId: data.id,
    };
  }

  public static toRejectSellerKycInputDto(
    data: ZodRejectSellerKycInputType,
  ): IRejectSellerKycInput {
    return {
      sellerId: data.id,
      reason: data.reason,
    };
  }

  public static toApproveAuctionCategoryInputDto(
    data: ZodApproveAuctionCategoryInputType,
  ): IApproveAuctionCategoryInputDto {
    return {
      categoryId: data.categoryId,
    };
  }

  public static toRejectAuctionCategoryInputDto(
    data: ZodRejectAuctionCategoryInputType,
  ): IRejectAuctionCategoryrequestInputDto {
    return {
      categoryId: data.categoryId,
      reason: data.reason,
    };
  }

  public static toChangeAuctionCategoryStatusInputDto(
    data: ZodChangeAuctionCategoryStatusInputType,
  ): IChangeAuctionCategoryStatusInputDto {
    return {
      categoryId: data.categoryId,
      status: data.status,
    };
  }

  public static toGetAdminAuctionsInputDto(
    data: ZodGetBrowseAuctionsInputType,
  ): IGetAdminAuctionsInputDto {
    return {
      auctionType: data.auctionType as AuctionType | 'ALL',
      categoryId: data.categoryId,
      page: data.page,
      limit: data.limit,
      sort: data.sort,
      order: data.order,
      search: data.search,
    };
  }

  public static toUpdateAuctionCategoryInputDto(
    data: ZodUpdateAuctionCategoryInputType,
  ): IUpdateAuctionCategoryInputDto {
    return {
      categoryId: data.categoryId,
      name: data.name,
      parentId: data.parentId || null,
    };
  }

  public static toCreateAuctionCategoryInputDto(
    data: ZodCreateAuctionCategoryInputType,
    userId: string,
  ): ICreateAuctionCategoryInputDto {
    return {
      name: data.name,
      parentId: data.parentId || null,
      userId: userId,
    };
  }

  public static toViewKycInputDto(
    data: ZodViewKycInputType,
    userId: string,
  ): IViewKycInputDto {
    return {
      userId: userId,
      documentId: data.documentId,
    };
  }
}
