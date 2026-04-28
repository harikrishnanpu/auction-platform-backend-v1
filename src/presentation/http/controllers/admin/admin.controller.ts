import { IGetAllUsersUsecase } from '@application/interfaces/usecases/admin/IGetAllUsersUsecase';
import { TYPES } from '@di/types.di';
import { ADMIN_CONSTANTS } from '@presentation/constants/admin/admin.constants';
import { AppError } from '@presentation/http/error/app.error';
import expressAsyncHandler from 'express-async-handler';
import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import {
    getAllUsersSchema,
    ZodGetAllUsersInputType,
} from '@presentation/validators/schemas/admin/getAllUsers.schema';
import {
    blockUserSchema,
    ZodBlockUserInputType,
} from '@presentation/validators/schemas/admin/blockUsers.schema';
import { IBlockUserOutput } from '@application/dtos/admin/blockuser.dto';
import { IBlockUserUsecase } from '@application/interfaces/usecases/admin/IBlockUserUsecase';
import { IGetUserOutput } from '@application/dtos/admin/getUser.dto';
import { IGetAdminUserUsecase } from '@application/interfaces/usecases/admin/IGetAdminUserUsecase';
import { IGetAllSellersUsecase } from '@application/interfaces/usecases/admin/IGetAllSellersUsecase';
import { IGetAdminDashboardStatsUsecase } from '@application/interfaces/usecases/admin/IGetAdminDashboardStatsUsecase';
import { IGetAdminSellerUsecase } from '@application/interfaces/usecases/admin/IGetAdminSellerUsecase';
import { IApproveSellerKycUsecase } from '@application/interfaces/usecases/admin/IApproveSellerKycUsecase';
import { IRejectSellerKycUsecase } from '@application/interfaces/usecases/admin/IRejectSellerKycUsecase';
import { IGetAllSellersOutput } from '@application/dtos/admin/getSellers.dto';
import { IGetAdminDashboardStatsOutputDto } from '@application/dtos/admin/getAdminDashboardStats.dto';
import { IRejectSellerKycOutput } from '@application/dtos/admin/rejectSellerKyc.dto';
import {
    getAdminUserSchema,
    ZodGetAdminUserInputType,
} from '@presentation/validators/schemas/admin/getAdminUser.schema';
import {
    getAdminSellerSchema,
    ZodGetAdminSellerInputType,
} from '@presentation/validators/schemas/admin/getAdminSeller.schema';
import {
    getAllSellersSchema,
    ZodGetAllSellersInputType,
} from '@presentation/validators/schemas/admin/getSellers.schema';
import {
    rejectSellerKycSchema,
    ZodRejectSellerKycInputType,
} from '@presentation/validators/schemas/admin/rejectSellerKyc.schema';
import { IGetAllCategoryRequestUsecase } from '@application/interfaces/usecases/admin/IGetAllCategoryrequestusecase';
import {
    approveAuctionCategorySchema,
    ZodApproveAuctionCategoryInputType,
} from '@presentation/validators/schemas/admin/approveAuctionCategory.schema';
import { IApproveAuctionCategoryUsecase } from '@application/interfaces/usecases/admin/IApproveAuctioncategoryUsecasse';
import {
    changeAuctionCategoryStatusSchema,
    ZodChangeAuctionCategoryStatusInputType,
} from '@presentation/validators/schemas/admin/changeAuctionStaus.schema';
import { IChangeAuctionCategoryStatusOutputDto } from '@application/dtos/admin/changeAuctionCategoryStatus.dto';
import { IChangeAuctionCategoryStatusUsecase } from '@application/interfaces/usecases/admin/IChangeAuctionCategoyUsecase';
import { IGetAllAdminAuctionCategoriesUsecase } from '@application/interfaces/usecases/admin/IGetAllAuctionCategoriesUsecase';
import {
    IGetAdminAuctionsOutputDto,
    IGetAdminAuctionsUsecase,
} from '@application/interfaces/usecases/admin/IGetAdminAuctionsUsecase';
import {
    UpdateAuctionCategorySchema,
    ZodUpdateAuctionCategoryInputType,
} from '@presentation/validators/schemas/admin/updateAuctionCategory.schema';
import { IUpdateAuctionCategoryUsecase } from '@application/interfaces/usecases/admin/IUpdateAuctioncategoryUsecase';
import {
    createAuctionCategorySchema,
    ZodCreateAuctionCategoryInputType,
} from '@presentation/validators/schemas/admin/createAuctionCategory.schema';
import { ICreateAuctionCategoryUsecase } from '@application/interfaces/usecases/admin/ICreateAuctionCategoryUsecase';
import { ICreateAuctionCategoryOutputDto } from '@application/dtos/admin/createAuctionCategory.dto';
import {
    getBrowseAuctionsSchema,
    ZodGetBrowseAuctionsInputType,
} from '@presentation/validators/schemas/auction/getBrowseAuctions.schema';
import {
    viewKycSchema,
    ZodViewKycInputType,
} from '@presentation/validators/schemas/admin/viewKyc.schema';
import { IViewKycUsecase } from '@application/interfaces/usecases/admin/IViewKycUsecase';
import { IRejectAuctionCategoryrequestUsecase } from '@application/interfaces/usecases/admin/IRejectAuctionCategoryrequestusecase';
import {
    rejectAuctionCategorySchema,
    ZodRejectAuctionCategoryInputType,
} from '@presentation/validators/schemas/admin/rejectAuctionCategory.schema';
import { ResponseHelper } from '@presentation/http/helpers/response.helper';
import { ValidationHelper } from '@presentation/http/helpers/validation.helper';
import { IGetAdminSellerOutput } from '@application/dtos/admin/getAdminSeller.dto';
import { IApproveSellerKycOutput } from '@application/dtos/admin/approveSellerKyc.dto';
import { IGetAllAdminAuctionCategoryResponseDto } from '@application/dtos/admin/getAllCategoryRequest.dto';
import { IApproveAuctionCategoryOutputDto } from '@application/dtos/admin/approveAuctionCategory.dto';
import { IRejectAuctionCategoryrequestOutputDto } from '@application/dtos/admin/rejectAuctionCategory.dto';
import { GetAllAuctionCategoryDto } from '@application/dtos/auction/getAllAuction.dto';
import { IUpdateAuctionCategoryOutputDto } from '@application/dtos/admin/updateAuctionCategory.dto';
import { IGetSystemConfigsUsecase } from '@application/interfaces/usecases/admin/IGetSystemConfigsUsecase';
import { IGetSystemConfigKeysUsecase } from '@application/interfaces/usecases/admin/IGetSystemConfigKeysUsecase';
import { ICreateSystemConfigUsecase } from '@application/interfaces/usecases/admin/ICreateSystemConfigUsecase';
import { IEditSystemConfigUsecase } from '@application/interfaces/usecases/admin/IEditSystemConfigUsecase';
import {
    IGetSystemConfigKeysOutputDto,
    IGetSystemConfigsOutputDto,
} from '@application/dtos/admin/systemConfig.dto';
import {
    createSystemConfigSchema,
    ZodCreateSystemConfigInputType,
} from '@presentation/validators/schemas/admin/createSystemConfig.schema';
import {
    editSystemConfigSchema,
    ZodEditSystemConfigInputType,
} from '@presentation/validators/schemas/admin/editSystemConfig.schema';
import {
    createSubscriptionPlanSchema,
    ZodCreateSubscriptionPlanInputType,
} from '@presentation/validators/schemas/admin/createSubscriptionPlan.schema';
import { ICreateSubscriptionPlanUsecase } from '@application/interfaces/usecases/admin/ICreateSubscriptionPlanUsecase';
import { IGetSubscriptionPlansUsecase } from '@application/interfaces/usecases/admin/IGetSubscriptionPlansUsecase';
import { IGetSubscribedUsersUsecase } from '@application/interfaces/usecases/admin/IGetSubscribedUsersUsecase';
import { IGetSubscriptionFeatureMetadataUsecase } from '@application/interfaces/usecases/admin/IGetSubscriptionFeatureMetadataUsecase';
import { IUpdateSubscriptionPlanStatusUsecase } from '@application/interfaces/usecases/admin/IUpdateSubscriptionPlanStatusUsecase';
import {
    IGetSubscribedUsersOutputDto,
    IGetSubscriptionFeatureMetadataOutputDto,
    IGetSubscriptionPlansOutputDto,
    ISubscriptionPlanDto,
} from '@application/dtos/admin/subscription.dto';
import {
    updateSubscriptionPlanStatusSchema,
    ZodUpdateSubscriptionPlanStatusInputType,
} from '@presentation/validators/schemas/admin/updateSubscriptionPlanStatus.schema';

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
        @inject(TYPES.IGetAdminDashboardStatsUsecase)
        private readonly _getAdminDashboardStatsUsecase: IGetAdminDashboardStatsUsecase,
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
        @inject(TYPES.IGetSystemConfigsUsecase)
        private readonly _getSystemConfigsUsecase: IGetSystemConfigsUsecase,
        @inject(TYPES.IGetSystemConfigKeysUsecase)
        private readonly _getSystemConfigKeysUsecase: IGetSystemConfigKeysUsecase,
        @inject(TYPES.ICreateSystemConfigUsecase)
        private readonly _createSystemConfigUsecase: ICreateSystemConfigUsecase,
        @inject(TYPES.IEditSystemConfigUsecase)
        private readonly _editSystemConfigUsecase: IEditSystemConfigUsecase,
        @inject(TYPES.ICreateSubscriptionPlanUsecase)
        private readonly _createSubscriptionPlanUsecase: ICreateSubscriptionPlanUsecase,
        @inject(TYPES.IGetSubscriptionPlansUsecase)
        private readonly _getSubscriptionPlansUsecase: IGetSubscriptionPlansUsecase,
        @inject(TYPES.IGetSubscribedUsersUsecase)
        private readonly _getSubscribedUsersUsecase: IGetSubscribedUsersUsecase,
        @inject(TYPES.IGetSubscriptionFeatureMetadataUsecase)
        private readonly _getSubscriptionFeatureMetadataUsecase: IGetSubscriptionFeatureMetadataUsecase,
        @inject(TYPES.IUpdateSubscriptionPlanStatusUsecase)
        private readonly _updateSubscriptionPlanStatusUsecase: IUpdateSubscriptionPlanStatusUsecase,
    ) {}

    getAllUsers = expressAsyncHandler(async (req: Request, res: Response) => {
        console.log(req.query);

        const validationResult =
            ValidationHelper.validate<ZodGetAllUsersInputType>(
                getAllUsersSchema,
                req.query,
            );

        const getAllUsersResult =
            await this._getAllUsersUsecase.execute(validationResult);

        if (getAllUsersResult.isFailure) {
            console.log(getAllUsersResult.getError());
            throw new AppError(
                getAllUsersResult.getError(),
                ADMIN_CONSTANTS.CODES.BAD_REQUEST,
            );
        }

        ResponseHelper.success(
            res,
            getAllUsersResult.getValue(),
            ADMIN_CONSTANTS.MESSAGES.GET_ALL_USERS_SUCCESSFULLY,
            ADMIN_CONSTANTS.CODES.OK,
        );
    });

    blockUser = expressAsyncHandler(async (req: Request, res: Response) => {
        const validationResult =
            ValidationHelper.validate<ZodBlockUserInputType>(
                blockUserSchema,
                req.body,
            );

        const blockUserResult =
            await this._blockUserUsecase.execute(validationResult);

        if (blockUserResult.isFailure) {
            throw new AppError(
                blockUserResult.getError(),
                ADMIN_CONSTANTS.CODES.BAD_REQUEST,
            );
        }

        ResponseHelper.success<IBlockUserOutput>(
            res,
            blockUserResult.getValue(),
            ADMIN_CONSTANTS.MESSAGES.BLOCK_USER_SUCCESSFULLY,
            ADMIN_CONSTANTS.CODES.OK,
        );
    });

    getUser = expressAsyncHandler(async (req: Request, res: Response) => {
        const validationResult =
            ValidationHelper.validate<ZodGetAdminUserInputType>(
                getAdminUserSchema,
                {
                    userId: req.params.id as string,
                },
            );

        const getAdminUserResult =
            await this._getAdminUserUsecase.execute(validationResult);

        if (getAdminUserResult.isFailure) {
            throw new AppError(
                getAdminUserResult.getError(),
                ADMIN_CONSTANTS.CODES.BAD_REQUEST,
            );
        }

        ResponseHelper.success<IGetUserOutput>(
            res,
            getAdminUserResult.getValue(),
            ADMIN_CONSTANTS.MESSAGES.GET_USER_SUCCESSFULLY,
            ADMIN_CONSTANTS.CODES.OK,
        );
    });

    getAllSellers = expressAsyncHandler(async (req: Request, res: Response) => {
        const validationResult =
            ValidationHelper.validate<ZodGetAllSellersInputType>(
                getAllSellersSchema,
                req.query,
            );

        const getAllSellersResult =
            await this._getAllSellersUsecase.execute(validationResult);

        if (getAllSellersResult.isFailure) {
            throw new AppError(
                getAllSellersResult.getError(),
                ADMIN_CONSTANTS.CODES.BAD_REQUEST,
            );
        }

        ResponseHelper.success<IGetAllSellersOutput>(
            res,
            getAllSellersResult.getValue(),
            ADMIN_CONSTANTS.MESSAGES.GET_ALL_SELLERS_SUCCESSFULLY,
            ADMIN_CONSTANTS.CODES.OK,
        );
    });

    getDashboardStats = expressAsyncHandler(
        async (_req: Request, res: Response) => {
            const result = await this._getAdminDashboardStatsUsecase.execute();
            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    ADMIN_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<IGetAdminDashboardStatsOutputDto>(
                res,
                result.getValue(),
                ADMIN_CONSTANTS.MESSAGES.GET_DASHBOARD_STATS_SUCCESSFULLY,
                ADMIN_CONSTANTS.CODES.OK,
            );
        },
    );

    getSeller = expressAsyncHandler(async (req: Request, res: Response) => {
        const validationResult =
            ValidationHelper.validate<ZodGetAdminSellerInputType>(
                getAdminSellerSchema,
                { id: req.params.id as string },
            );

        const getSellerResult =
            await this._getAdminSellerUsecase.execute(validationResult);

        if (getSellerResult.isFailure) {
            throw new AppError(
                getSellerResult.getError(),
                ADMIN_CONSTANTS.CODES.BAD_REQUEST,
            );
        }

        ResponseHelper.success<IGetAdminSellerOutput>(
            res,
            getSellerResult.getValue(),
            ADMIN_CONSTANTS.MESSAGES.GET_SELLER_SUCCESSFULLY,
            ADMIN_CONSTANTS.CODES.OK,
        );
    });

    approveSellerKyc = expressAsyncHandler(
        async (req: Request, res: Response) => {
            const validationResult =
                ValidationHelper.validate<ZodGetAdminSellerInputType>(
                    getAdminSellerSchema,
                    { id: req.params.id as string },
                );

            const result =
                await this._approveSellerKycUsecase.execute(validationResult);

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    ADMIN_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<IApproveSellerKycOutput>(
                res,
                result.getValue(),
                ADMIN_CONSTANTS.MESSAGES.APPROVE_SELLER_KYC_SUCCESSFULLY,
                ADMIN_CONSTANTS.CODES.OK,
            );
        },
    );

    rejectSellerKyc = expressAsyncHandler(
        async (req: Request, res: Response) => {
            const validationResult =
                ValidationHelper.validate<ZodRejectSellerKycInputType>(
                    rejectSellerKycSchema,
                    {
                        id: req.params.id as string,
                        reason: req.body.reason,
                    },
                );

            const result =
                await this._rejectSellerKycUsecase.execute(validationResult);

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    ADMIN_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<IRejectSellerKycOutput>(
                res,
                result.getValue(),
                ADMIN_CONSTANTS.MESSAGES.REJECT_SELLER_KYC_SUCCESSFULLY,
                ADMIN_CONSTANTS.CODES.OK,
            );
        },
    );

    getAllCategoryRequest = expressAsyncHandler(
        async (req: Request, res: Response) => {
            const result = await this._getAllCategoryRequestUsecase.execute();

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    ADMIN_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<IGetAllAdminAuctionCategoryResponseDto>(
                res,
                result.getValue(),
                ADMIN_CONSTANTS.MESSAGES.GET_ALL_CATEGORY_REQUEST_SUCCESSFULLY,
                ADMIN_CONSTANTS.CODES.OK,
            );
        },
    );

    approveAuctionCategory = expressAsyncHandler(
        async (req: Request, res: Response) => {
            const validationResult =
                ValidationHelper.validate<ZodApproveAuctionCategoryInputType>(
                    approveAuctionCategorySchema,
                    {
                        categoryId: req.params.id as string,
                    },
                );

            const result =
                await this._approveAuctionCategoryUsecase.execute(
                    validationResult,
                );

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    ADMIN_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<IApproveAuctionCategoryOutputDto>(
                res,
                result.getValue(),
                ADMIN_CONSTANTS.MESSAGES.APPROVE_AUCTION_CATEGORY_SUCCESSFULLY,
                ADMIN_CONSTANTS.CODES.OK,
            );
        },
    );

    rejectAuctionCategory = expressAsyncHandler(
        async (req: Request, res: Response) => {
            const validationResult =
                ValidationHelper.validate<ZodRejectAuctionCategoryInputType>(
                    rejectAuctionCategorySchema,
                    {
                        categoryId: req.params.id as string,
                        reason: req.body.reason,
                    },
                );

            const result =
                await this._rejectAuctionCategoryUsecase.execute(
                    validationResult,
                );

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    ADMIN_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<IRejectAuctionCategoryrequestOutputDto>(
                res,
                result.getValue(),
                ADMIN_CONSTANTS.MESSAGES.REJECT_AUCTION_CATEGORY_SUCCESSFULLY,
                ADMIN_CONSTANTS.CODES.OK,
            );
        },
    );

    changeAuctionCategoryStatus = expressAsyncHandler(
        async (req: Request, res: Response) => {
            const validationResult =
                ValidationHelper.validate<ZodChangeAuctionCategoryStatusInputType>(
                    changeAuctionCategoryStatusSchema,
                    {
                        categoryId: req.params.id as string,
                        status: req.body.status,
                    },
                );

            const result =
                await this._changeAuctionCategoryStatusUsecase.execute(
                    validationResult,
                );

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    ADMIN_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<IChangeAuctionCategoryStatusOutputDto>(
                res,
                result.getValue(),
                ADMIN_CONSTANTS.MESSAGES
                    .CHANGE_AUCTION_CATEGORY_STATUS_SUCCESSFULLY,
                ADMIN_CONSTANTS.CODES.OK,
            );
        },
    );

    getAllAdminAuctionCategories = expressAsyncHandler(
        async (req: Request, res: Response) => {
            const result =
                await this._getAllAdminAuctionCategoriesUsecase.execute();

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    ADMIN_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<GetAllAuctionCategoryDto>(
                res,
                result.getValue(),
                ADMIN_CONSTANTS.MESSAGES
                    .GET_ALL_AUCTION_CATEGORIES_SUCCESSFULLY,
                ADMIN_CONSTANTS.CODES.OK,
            );
        },
    );

    getAllAdminAuctions = expressAsyncHandler(
        async (req: Request, res: Response) => {
            if (!req.user) {
                throw new AppError(
                    ADMIN_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                    ADMIN_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            const validationResult =
                ValidationHelper.validate<ZodGetBrowseAuctionsInputType>(
                    getBrowseAuctionsSchema,
                    {
                        ...req.query,
                        userId: req.user.id,
                    } as unknown as ZodGetBrowseAuctionsInputType,
                );

            const result =
                await this._getAllAdminAuctionsUsecase.execute(
                    validationResult,
                );

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    ADMIN_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<IGetAdminAuctionsOutputDto>(
                res,
                result.getValue(),
                ADMIN_CONSTANTS.MESSAGES.GET_ALL_ADMIN_AUCTIONS_SUCCESSFULLY,
                ADMIN_CONSTANTS.CODES.OK,
            );
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

            const validationResult =
                ValidationHelper.validate<ZodUpdateAuctionCategoryInputType>(
                    UpdateAuctionCategorySchema,
                    {
                        categoryId: req.params.id as string,
                        name: req.body.name as string,
                        parentId: req.body.parentId as string | null,
                    },
                );

            const result =
                await this._updateAuctionCategoryUsecase.execute(
                    validationResult,
                );

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    ADMIN_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<IUpdateAuctionCategoryOutputDto>(
                res,
                result.getValue(),
                ADMIN_CONSTANTS.MESSAGES.UPDATE_AUCTION_CATEGORY_SUCCESSFULLY,
                ADMIN_CONSTANTS.CODES.OK,
            );
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

            const validationResult =
                ValidationHelper.validate<ZodCreateAuctionCategoryInputType>(
                    createAuctionCategorySchema,
                    {
                        name: req.body.name,
                        parentId: req.body?.parentId,
                        userId: req.user.id,
                    },
                );

            const result =
                await this._createAuctionCategoryUsecase.execute(
                    validationResult,
                );

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    ADMIN_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<ICreateAuctionCategoryOutputDto>(
                res,
                result.getValue(),
                ADMIN_CONSTANTS.MESSAGES.CREATE_AUCTION_CATEGORY_SUCCESSFULLY,
                ADMIN_CONSTANTS.CODES.OK,
            );
        },
    );

    viewKyc = expressAsyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            throw new AppError(
                ADMIN_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                ADMIN_CONSTANTS.CODES.BAD_REQUEST,
            );
        }

        const validationResult = ValidationHelper.validate<ZodViewKycInputType>(
            viewKycSchema,
            {
                documentId: req.params.id as string,
                userId: req.user.id,
            },
        );

        const result = await this._viewKycUsecase.execute(validationResult);

        if (result.isFailure) {
            throw new AppError(
                result.getError(),
                ADMIN_CONSTANTS.CODES.BAD_REQUEST,
            );
        }

        result.getValue().stream.pipe(res);
    });

    getSystemConfigs = expressAsyncHandler(
        async (_req: Request, res: Response) => {
            const result = await this._getSystemConfigsUsecase.execute();

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    ADMIN_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<IGetSystemConfigsOutputDto>(
                res,
                result.getValue(),
                ADMIN_CONSTANTS.MESSAGES.GET_SYSTEM_CONFIGS_SUCCESSFULLY,
                ADMIN_CONSTANTS.CODES.OK,
            );
        },
    );

    getSystemConfigKeys = expressAsyncHandler(
        async (_req: Request, res: Response) => {
            const result = await this._getSystemConfigKeysUsecase.execute();

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    ADMIN_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<IGetSystemConfigKeysOutputDto>(
                res,
                result.getValue(),
                ADMIN_CONSTANTS.MESSAGES.GET_SYSTEM_CONFIG_KEYS_SUCCESSFULLY,
                ADMIN_CONSTANTS.CODES.OK,
            );
        },
    );

    createSystemConfig = expressAsyncHandler(
        async (req: Request, res: Response) => {
            const validationResult =
                ValidationHelper.validate<ZodCreateSystemConfigInputType>(
                    createSystemConfigSchema,
                    req.body,
                );

            const result =
                await this._createSystemConfigUsecase.execute(validationResult);

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    ADMIN_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success(
                res,
                result.getValue(),
                ADMIN_CONSTANTS.MESSAGES.CREATE_SYSTEM_CONFIG_SUCCESSFULLY,
                ADMIN_CONSTANTS.CODES.OK,
            );
        },
    );

    editSystemConfig = expressAsyncHandler(
        async (req: Request, res: Response) => {
            const validationResult =
                ValidationHelper.validate<ZodEditSystemConfigInputType>(
                    editSystemConfigSchema,
                    req.body,
                );

            const result =
                await this._editSystemConfigUsecase.execute(validationResult);

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    ADMIN_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success(
                res,
                result.getValue(),
                ADMIN_CONSTANTS.MESSAGES.EDIT_SYSTEM_CONFIG_SUCCESSFULLY,
                ADMIN_CONSTANTS.CODES.OK,
            );
        },
    );

    createSubscriptionPlan = expressAsyncHandler(
        async (req: Request, res: Response) => {
            const validationResult =
                ValidationHelper.validate<ZodCreateSubscriptionPlanInputType>(
                    createSubscriptionPlanSchema,
                    req.body,
                );

            const result =
                await this._createSubscriptionPlanUsecase.execute(
                    validationResult,
                );

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    ADMIN_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<ISubscriptionPlanDto>(
                res,
                result.getValue(),
                ADMIN_CONSTANTS.MESSAGES.CREATE_SUBSCRIPTION_PLAN_SUCCESSFULLY,
                ADMIN_CONSTANTS.CODES.OK,
            );
        },
    );

    getSubscriptionPlans = expressAsyncHandler(
        async (_req: Request, res: Response) => {
            const result = await this._getSubscriptionPlansUsecase.execute();

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    ADMIN_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<IGetSubscriptionPlansOutputDto>(
                res,
                result.getValue(),
                ADMIN_CONSTANTS.MESSAGES.GET_SUBSCRIPTION_PLANS_SUCCESSFULLY,
                ADMIN_CONSTANTS.CODES.OK,
            );
        },
    );

    updateSubscriptionPlanStatus = expressAsyncHandler(
        async (req: Request, res: Response) => {
            const validationResult =
                ValidationHelper.validate<ZodUpdateSubscriptionPlanStatusInputType>(
                    updateSubscriptionPlanStatusSchema,
                    {
                        planId: req.params.id as string,
                        isDefault: req.body.isDefault,
                        isActive: req.body.isActive,
                    },
                );

            const result =
                await this._updateSubscriptionPlanStatusUsecase.execute(
                    validationResult,
                );

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    ADMIN_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<ISubscriptionPlanDto>(
                res,
                result.getValue(),
                ADMIN_CONSTANTS.MESSAGES
                    .UPDATE_SUBSCRIPTION_PLAN_STATUS_SUCCESSFULLY,
                ADMIN_CONSTANTS.CODES.OK,
            );
        },
    );

    getSubscribedUsers = expressAsyncHandler(
        async (_req: Request, res: Response) => {
            const result = await this._getSubscribedUsersUsecase.execute();

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    ADMIN_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<IGetSubscribedUsersOutputDto>(
                res,
                result.getValue(),
                ADMIN_CONSTANTS.MESSAGES.GET_SUBSCRIBED_USERS_SUCCESSFULLY,
                ADMIN_CONSTANTS.CODES.OK,
            );
        },
    );

    getSubscriptionFeatureMetadata = expressAsyncHandler(
        async (_req: Request, res: Response) => {
            const result =
                await this._getSubscriptionFeatureMetadataUsecase.execute();

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    ADMIN_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<IGetSubscriptionFeatureMetadataOutputDto>(
                res,
                result.getValue(),
                ADMIN_CONSTANTS.MESSAGES.GET_SUBSCRIPTION_FEATURES_SUCCESSFULLY,
                ADMIN_CONSTANTS.CODES.OK,
            );
        },
    );
}
