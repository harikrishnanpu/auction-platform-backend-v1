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
}
