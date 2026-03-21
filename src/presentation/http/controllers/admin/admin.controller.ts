import { IGetAllUsersInput } from '@application/dtos/admin/getAllusers.dto';
import { UserRoleType } from '@application/dtos/auth/loginUser.dto';
import { IGetAllUsersUsecase } from '@application/interfaces/usecases/admin/IGetAllUsersUsecase';
import { TYPES } from '@di/types.di';
import {
  AuthProviderType,
  UserStatus,
} from '@domain/entities/user/user.entity';
import { ADMIN_CONSTANTS } from '@presentation/constants/admin/admin.constants';
import { AppError } from '@presentation/http/error/app.error';
import expressAsyncHandler from 'express-async-handler';
import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { getAllUsersSchema } from '@presentation/validators/schemas/admin/getAllUsers.schema';
import { blockUserSchema } from '@presentation/validators/schemas/admin/blockUsers.schema';
import { IBlockUserInput } from '@application/dtos/admin/blockuser.dto';
import { IBlockUserUsecase } from '@application/interfaces/usecases/admin/IBlockUserUsecase';
import { IGetUserInput } from '@application/dtos/admin/getUser.dto';
import { IGetAdminUserUsecase } from '@application/interfaces/usecases/admin/IGetAdminUserUsecase';
import { IGetAllSellersUsecase } from '@application/interfaces/usecases/admin/IGetAllSellersUsecase';
import { IGetAdminSellerUsecase } from '@application/interfaces/usecases/admin/IGetAdminSellerUsecase';
import { IApproveSellerKycUsecase } from '@application/interfaces/usecases/admin/IApproveSellerKycUsecase';
import { IRejectSellerKycUsecase } from '@application/interfaces/usecases/admin/IRejectSellerKycUsecase';
import { IGetAllSellersInput } from '@application/dtos/admin/getSellers.dto';
import { IRejectSellerKycInput } from '@application/dtos/admin/rejectSellerKyc.dto';
import { getAdminUserSchema } from '@presentation/validators/schemas/admin/getAdminUser.schema';
import { getAdminSellerSchema } from '@presentation/validators/schemas/admin/getAdminSeller.schema';
import { getAllSellersSchema } from '@presentation/validators/schemas/admin/getSellers.schema';
import { rejectSellerKycSchema } from '@presentation/validators/schemas/admin/rejectSellerKyc.schema';
import { IGetAllCategoryRequestUsecase } from '@application/interfaces/usecases/admin/IGetAllCategoryrequestusecase';
import { approveAuctionCategorySchema } from '@presentation/validators/schemas/admin/approveAuctionCategory.schema';
import { AuctionMapperProrfile } from '@application/mappers/auction/auction.mapperProfile';
import { IApproveAuctionCategoryUsecase } from '@application/interfaces/usecases/admin/IApproveAuctioncategoryUsecasse';
import { changeAuctionCategoryStatusSchema } from '@presentation/validators/schemas/admin/changeAuctionStaus.schema';
import { IChangeAuctionCategoryStatusInputDto } from '@application/dtos/admin/changeAuctionCategoryStatus.dto';
import { IChangeAuctionCategoryStatusUsecase } from '@application/interfaces/usecases/admin/IChangeAuctionCategoyUsecase';
import { IGetAllAdminAuctionCategoriesUsecase } from '@application/interfaces/usecases/admin/IGetAllAuctionCategoriesUsecase';
import { IGetAdminAuctionsUsecase } from '@application/interfaces/usecases/admin/IGetAdminAuctionsUsecase';
import { UpdateAuctionCategorySchema } from '@presentation/validators/schemas/admin/updateAuctionCategory.schema';
import { IUpdateAuctionCategoryUsecase } from '@application/interfaces/usecases/admin/IUpdateAuctioncategoryUsecase';
import { createAuctionCategorySchema } from '@presentation/validators/schemas/admin/createAuctionCategory.schema';
import { ICreateAuctionCategoryUsecase } from '@application/interfaces/usecases/admin/ICreateAuctionCategoryUsecase';
import { ICreateAuctionCategoryInputDto } from '@application/dtos/admin/createAuctionCategory.dto';
import { getBrowseAuctionsSchema } from '@presentation/validators/schemas/auction/getBrowseAuctions.schema';
import { viewKycSchema } from '@presentation/validators/schemas/admin/viewKyc.schema';
import { IViewKycUsecase } from '@application/interfaces/usecases/admin/IViewKycUsecase';
import { IViewKycInputDto } from '@application/dtos/admin/viewKyc.dto';
import { IRejectAuctionCategoryrequestUsecase } from '@application/interfaces/usecases/admin/IRejectAuctionCategoryrequestusecase';
import { rejectAuctionCategorySchema } from '@presentation/validators/schemas/admin/rejectAuctionCategory.schema';
import { AuctionType } from '@domain/entities/auction/auction.entity';

@injectable()
export class AdminController {
  constructor(
    @inject(TYPES.IGetAllUsersUseCase)
    private readonly _getAllUsersUsecase: IGetAllUsersUsecase,
    @inject(TYPES.IBlockUserUsecase)
    private readonly _blockUserUsecase: IBlockUserUsecase,
    @inject(TYPES.IGetAdminUserUsecase)
    private readonly _getAdminUserUsecase: IGetAdminUserUsecase,
    @inject(TYPES.IGetAllSellersUsecase)
    private readonly _getAllSellersUsecase: IGetAllSellersUsecase,
    @inject(TYPES.IGetAdminSellerUsecase)
    private readonly _getAdminSellerUsecase: IGetAdminSellerUsecase,
    @inject(TYPES.IApproveSellerKycUsecase)
    private readonly _approveSellerKycUsecase: IApproveSellerKycUsecase,
    @inject(TYPES.IRejectSellerKycUsecase)
    private readonly _rejectSellerKycUsecase: IRejectSellerKycUsecase,
    @inject(TYPES.IGetAllCategoryRequestUsecase)
    private readonly _getAllCategoryRequestUsecase: IGetAllCategoryRequestUsecase,
    @inject(TYPES.IApproveAuctionCategoryUsecase)
    private readonly _approveAuctionCategoryUsecase: IApproveAuctionCategoryUsecase,
    @inject(TYPES.IChangeAuctionCategoryStatusUsecase)
    private readonly _changeAuctionCategoryStatusUsecase: IChangeAuctionCategoryStatusUsecase,
    @inject(TYPES.IGetAllAdminAuctionCategoriesUsecase)
    private readonly _getAllAdminAuctionCategoriesUsecase: IGetAllAdminAuctionCategoriesUsecase,
    @inject(TYPES.IGetAdminAuctionsUsecase)
    private readonly _getAllAdminAuctionsUsecase: IGetAdminAuctionsUsecase,
    @inject(TYPES.IUpdateAuctionCategoryUsecase)
    private readonly _updateAuctionCategoryUsecase: IUpdateAuctionCategoryUsecase,
    @inject(TYPES.ICreateAuctionCategoryUsecase)
    private readonly _createAuctionCategoryUsecase: ICreateAuctionCategoryUsecase,
    @inject(TYPES.IViewKycUsecase)
    private readonly _viewKycUsecase: IViewKycUsecase,
    @inject(TYPES.IRejectAuctionCategoryUsecase)
    private readonly _rejectAuctionCategoryUsecase: IRejectAuctionCategoryrequestUsecase,
  ) {}

  getAllUsers = expressAsyncHandler(async (req: Request, res: Response) => {
    const validationResult = getAllUsersSchema.safeParse(req.query);

    console.log(req.query);

    if (!validationResult.success) {
      console.log(validationResult.error.message);
      throw new AppError(
        validationResult.error.issues[0].message,
        ADMIN_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    const { page, limit, search, sort, order, role, status, authProvider } =
      validationResult.data;

    const getAllUsersInput: IGetAllUsersInput = {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search: search ?? '',
      sort: sort ?? 'createdAt',
      order: (order as 'asc' | 'desc') ?? 'desc',
      role: (role as UserRoleType | null) ?? 'ALL',
      status: (status as UserStatus | null) ?? 'ALL',
      authProvider: (authProvider as AuthProviderType | null) ?? 'ALL',
    };

    const getAllUsersResult =
      await this._getAllUsersUsecase.execute(getAllUsersInput);

    console.log(getAllUsersResult.getValue());

    if (getAllUsersResult.isFailure) {
      console.log(getAllUsersResult.getError());
      throw new AppError(
        getAllUsersResult.getError(),
        ADMIN_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    res.status(ADMIN_CONSTANTS.CODES.OK).json({
      data: getAllUsersResult.getValue(),
      success: true,
      message: ADMIN_CONSTANTS.MESSAGES.GET_ALL_USERS_SUCCESSFULLY,
      status: ADMIN_CONSTANTS.CODES.OK,
      error: null,
    });
  });

  blockUser = expressAsyncHandler(async (req: Request, res: Response) => {
    const validationResult = blockUserSchema.safeParse({
      userId: req.params.id,
      block: req.body.block,
    });
    if (!validationResult.success) {
      throw new AppError(
        validationResult.error.issues[0].message,
        ADMIN_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    const { userId, block } = validationResult.data;

    const blockUserInput: IBlockUserInput = {
      userId: userId,
      block: block,
    };

    const blockUserResult =
      await this._blockUserUsecase.execute(blockUserInput);
    if (blockUserResult.isFailure) {
      throw new AppError(
        blockUserResult.getError(),
        ADMIN_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    res.status(ADMIN_CONSTANTS.CODES.OK).json({
      data: blockUserResult.getValue(),
      success: true,
      message: ADMIN_CONSTANTS.MESSAGES.BLOCK_USER_SUCCESSFULLY,
      status: ADMIN_CONSTANTS.CODES.OK,
      error: null,
    });
  });

  getUser = expressAsyncHandler(async (req: Request, res: Response) => {
    const validationResult = getAdminUserSchema.safeParse({
      userId: req.params.id,
    });

    if (!validationResult.success) {
      throw new AppError(
        validationResult.error.issues[0].message,
        ADMIN_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    const { userId } = validationResult.data;

    const getAdminUserInput: IGetUserInput = {
      userId: userId,
    };

    const getAdminUserResult =
      await this._getAdminUserUsecase.execute(getAdminUserInput);

    if (getAdminUserResult.isFailure) {
      throw new AppError(
        getAdminUserResult.getError(),
        ADMIN_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    res.status(ADMIN_CONSTANTS.CODES.OK).json({
      data: getAdminUserResult.getValue(),
      success: true,
      message: ADMIN_CONSTANTS.MESSAGES.GET_USER_SUCCESSFULLY,
      status: ADMIN_CONSTANTS.CODES.OK,
      error: null,
    });
  });

  getAllSellers = expressAsyncHandler(async (req: Request, res: Response) => {
    const validationResult = getAllSellersSchema.safeParse(req.query);

    if (!validationResult.success) {
      throw new AppError(
        validationResult.error.issues[0].message,
        ADMIN_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    const { page, limit, pendingOnly } = validationResult.data;

    const getAllSellersInput: IGetAllSellersInput = {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      pendingOnly: pendingOnly ?? false,
    };

    const getAllSellersResult =
      await this._getAllSellersUsecase.execute(getAllSellersInput);

    if (getAllSellersResult.isFailure) {
      throw new AppError(
        getAllSellersResult.getError(),
        ADMIN_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    res.status(ADMIN_CONSTANTS.CODES.OK).json({
      data: getAllSellersResult.getValue(),
      success: true,
      message: ADMIN_CONSTANTS.MESSAGES.GET_ALL_SELLERS_SUCCESSFULLY,
      status: ADMIN_CONSTANTS.CODES.OK,
      error: null,
    });
  });

  getSeller = expressAsyncHandler(async (req: Request, res: Response) => {
    const validationResult = getAdminSellerSchema.safeParse({
      id: req.params.id,
    });

    if (!validationResult.success) {
      throw new AppError(
        validationResult.error.issues[0].message,
        ADMIN_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    const { id: sellerId } = validationResult.data;
    const getSellerResult = await this._getAdminSellerUsecase.execute({
      sellerId,
    });

    if (getSellerResult.isFailure) {
      throw new AppError(
        getSellerResult.getError(),
        ADMIN_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    res.status(ADMIN_CONSTANTS.CODES.OK).json({
      data: getSellerResult.getValue(),
      success: true,
      message: ADMIN_CONSTANTS.MESSAGES.GET_SELLER_SUCCESSFULLY,
      status: ADMIN_CONSTANTS.CODES.OK,
      error: null,
    });
  });

  approveSellerKyc = expressAsyncHandler(
    async (req: Request, res: Response) => {
      const validationResult = getAdminSellerSchema.safeParse({
        id: req.params.id,
      });

      if (!validationResult.success) {
        throw new AppError(
          validationResult.error.issues[0].message,
          ADMIN_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      const { id: sellerId } = validationResult.data;
      const result = await this._approveSellerKycUsecase.execute({ sellerId });

      if (result.isFailure) {
        throw new AppError(
          result.getError(),
          ADMIN_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      res.status(ADMIN_CONSTANTS.CODES.OK).json({
        data: result.getValue(),
        success: true,
        message: ADMIN_CONSTANTS.MESSAGES.APPROVE_SELLER_KYC_SUCCESSFULLY,
        status: ADMIN_CONSTANTS.CODES.OK,
        error: null,
      });
    },
  );

  rejectSellerKyc = expressAsyncHandler(async (req: Request, res: Response) => {
    const paramsResult = getAdminSellerSchema.safeParse({
      id: req.params.id,
    });

    if (!paramsResult.success) {
      throw new AppError(
        paramsResult.error.issues[0].message,
        ADMIN_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    const bodyResult = rejectSellerKycSchema.safeParse(req.body ?? {});
    const body = bodyResult.success ? bodyResult.data : {};

    const { id: sellerId } = paramsResult.data;
    const input: IRejectSellerKycInput = {
      sellerId,
      reason: body.reason,
    };

    const result = await this._rejectSellerKycUsecase.execute(input);

    if (result.isFailure) {
      throw new AppError(result.getError(), ADMIN_CONSTANTS.CODES.BAD_REQUEST);
    }

    res.status(ADMIN_CONSTANTS.CODES.OK).json({
      data: result.getValue(),
      success: true,
      message: ADMIN_CONSTANTS.MESSAGES.REJECT_SELLER_KYC_SUCCESSFULLY,
      status: ADMIN_CONSTANTS.CODES.OK,
      error: null,
    });
  });

  getAllCategoryRequest = expressAsyncHandler(
    async (req: Request, res: Response) => {
      const result = await this._getAllCategoryRequestUsecase.execute();

      if (result.isFailure) {
        throw new AppError(
          result.getError(),
          ADMIN_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      res.status(ADMIN_CONSTANTS.CODES.OK).json({
        data: result.getValue(),
        success: true,
        message: ADMIN_CONSTANTS.MESSAGES.GET_ALL_CATEGORY_REQUEST_SUCCESSFULLY,
        status: ADMIN_CONSTANTS.CODES.OK,
        error: null,
      });
    },
  );

  approveAuctionCategory = expressAsyncHandler(
    async (req: Request, res: Response) => {
      const validationResult = approveAuctionCategorySchema.safeParse({
        categoryId: req.params.id,
      });

      if (!validationResult.success) {
        throw new AppError(
          validationResult.error.issues[0].message,
          ADMIN_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      const input = AuctionMapperProrfile.toApproveAuctionCategoryInputDto(
        validationResult.data,
      );

      const result = await this._approveAuctionCategoryUsecase.execute(input);

      if (result.isFailure) {
        throw new AppError(
          result.getError(),
          ADMIN_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      res.status(ADMIN_CONSTANTS.CODES.OK).json({
        data: result.getValue(),
        success: true,
        message: ADMIN_CONSTANTS.MESSAGES.APPROVE_AUCTION_CATEGORY_SUCCESSFULLY,
        status: ADMIN_CONSTANTS.CODES.OK,
        error: null,
      });
    },
  );

  rejectAuctionCategory = expressAsyncHandler(
    async (req: Request, res: Response) => {
      const validationResult = rejectAuctionCategorySchema.safeParse({
        categoryId: req.params.id,
        reason: req.body.reason,
      });

      if (!validationResult.success) {
        throw new AppError(
          validationResult.error.issues[0].message,
          ADMIN_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      const input = AuctionMapperProrfile.toRejectAuctionCategoryInputDto(
        validationResult.data,
      );

      const result = await this._rejectAuctionCategoryUsecase.execute(input);

      if (result.isFailure) {
        throw new AppError(
          result.getError(),
          ADMIN_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      res.status(ADMIN_CONSTANTS.CODES.OK).json({
        data: result.getValue(),
        success: true,
        message: ADMIN_CONSTANTS.MESSAGES.REJECT_AUCTION_CATEGORY_SUCCESSFULLY,
        status: ADMIN_CONSTANTS.CODES.OK,
        error: null,
      });
    },
  );

  changeAuctionCategoryStatus = expressAsyncHandler(
    async (req: Request, res: Response) => {
      const validationResult = changeAuctionCategoryStatusSchema.safeParse({
        categoryId: req.params.id,
        status: req.body.status,
      });

      if (!validationResult.success) {
        throw new AppError(
          validationResult.error.issues[0].message,
          ADMIN_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      const inuput: IChangeAuctionCategoryStatusInputDto = {
        categoryId: validationResult.data.categoryId.trim(),
        status: validationResult.data.status,
      };

      const result =
        await this._changeAuctionCategoryStatusUsecase.execute(inuput);

      if (result.isFailure) {
        throw new AppError(
          result.getError(),
          ADMIN_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      res.status(ADMIN_CONSTANTS.CODES.OK).json({
        data: result.getValue(),
        success: true,
        message:
          ADMIN_CONSTANTS.MESSAGES.CHANGE_AUCTION_CATEGORY_STATUS_SUCCESSFULLY,
        status: ADMIN_CONSTANTS.CODES.OK,
        error: null,
      });
    },
  );

  getAllAdminAuctionCategories = expressAsyncHandler(
    async (req: Request, res: Response) => {
      const result = await this._getAllAdminAuctionCategoriesUsecase.execute();

      if (result.isFailure) {
        throw new AppError(
          result.getError(),
          ADMIN_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      res.status(ADMIN_CONSTANTS.CODES.OK).json({
        data: result.getValue(),
        success: true,
        message:
          ADMIN_CONSTANTS.MESSAGES.GET_ALL_AUCTION_CATEGORIES_SUCCESSFULLY,
        status: ADMIN_CONSTANTS.CODES.OK,
        error: null,
      });
    },
  );

  getAllAdminAuctions = expressAsyncHandler(
    async (req: Request, res: Response) => {
      const parsed = getBrowseAuctionsSchema.safeParse(req.query);
      if (!parsed.success) {
        throw new AppError(
          parsed.error.issues[0]?.message ?? 'Invalid query',
          ADMIN_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      const result = await this._getAllAdminAuctionsUsecase.execute({
        auctionType: parsed.data.auctionType as AuctionType,
        categoryId: parsed.data.categoryId,
        page: parsed.data.page,
        limit: parsed.data.limit,
        sort: parsed.data.sort,
        order: parsed.data.order,
        search: parsed.data.search,
      });

      if (result.isFailure) {
        throw new AppError(
          result.getError(),
          ADMIN_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      res.status(ADMIN_CONSTANTS.CODES.OK).json({
        data: result.getValue(),
        success: true,
        message: 'All auctions fetched successfully',
        status: ADMIN_CONSTANTS.CODES.OK,
        error: null,
      });
    },
  );

  updateAuctionCategory = expressAsyncHandler(
    async (req: Request, res: Response) => {
      if (!req.user) {
        throw new AppError(
          ADMIN_CONSTANTS.MESSAGES.USER_NOT_FOUND,
          ADMIN_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      const validationResult = UpdateAuctionCategorySchema.safeParse({
        categoryId: req.params.id,
        name: req.body.name,
        parentId: req.body.parentId,
      });

      if (!validationResult.success) {
        throw new AppError(
          validationResult.error.issues[0].message,
          ADMIN_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      const input = AuctionMapperProrfile.toUpdateAuctionCategoryInputDto(
        validationResult.data,
      );

      const result = await this._updateAuctionCategoryUsecase.execute(input);

      if (result.isFailure) {
        throw new AppError(
          result.getError(),
          ADMIN_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      res.status(ADMIN_CONSTANTS.CODES.OK).json({
        data: result.getValue(),
        success: true,
        message: ADMIN_CONSTANTS.MESSAGES.UPDATE_AUCTION_CATEGORY_SUCCESSFULLY,
        status: ADMIN_CONSTANTS.CODES.OK,
        error: null,
      });
    },
  );

  createAuctionCategory = expressAsyncHandler(
    async (req: Request, res: Response) => {
      if (!req.user) {
        throw new AppError(
          ADMIN_CONSTANTS.MESSAGES.USER_NOT_FOUND,
          ADMIN_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      const validationResult = createAuctionCategorySchema.safeParse({
        name: req.body?.name,
        parentId: req.body?.parentId,
      });

      if (!validationResult.success) {
        throw new AppError(
          validationResult.error.issues[0].message,
          ADMIN_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      const input: ICreateAuctionCategoryInputDto = {
        name: validationResult.data.name,
        parentId: validationResult.data.parentId ?? null,
        userId: req.user.id,
      };

      const result = await this._createAuctionCategoryUsecase.execute(input);

      if (result.isFailure) {
        throw new AppError(
          result.getError(),
          ADMIN_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      res.status(ADMIN_CONSTANTS.CODES.OK).json({
        data: result.getValue(),
        success: true,
        message: ADMIN_CONSTANTS.MESSAGES.CREATE_AUCTION_CATEGORY_SUCCESSFULLY,
        status: ADMIN_CONSTANTS.CODES.OK,
        error: null,
      });
    },
  );

  viewKyc = expressAsyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(
        ADMIN_CONSTANTS.MESSAGES.USER_NOT_FOUND,
        ADMIN_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    const validationResult = viewKycSchema.safeParse({
      documentId: req.params.id,
    });

    if (!validationResult.success) {
      throw new AppError(
        validationResult.error.issues[0].message,
        ADMIN_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    const viewKycInput: IViewKycInputDto = {
      userId: req.user.id,
      documentId: validationResult.data.documentId,
    };

    const result = await this._viewKycUsecase.execute(viewKycInput);

    if (result.isFailure) {
      throw new AppError(result.getError(), ADMIN_CONSTANTS.CODES.BAD_REQUEST);
    }

    result.getValue().stream.pipe(res);
  });
}
