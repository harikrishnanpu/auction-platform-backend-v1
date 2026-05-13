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
import { IEditSystemConfigUsecase } from '@application/interfaces/usecases/admin/IEditSystemConfigUsecase';
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
import { IGetSubscriptionFeaturesUsecase } from '@application/interfaces/usecases/admin/IGetSubscriptionFeatureUsecase';
import { IUpdateSubscriptionPlanStatusUsecase } from '@application/interfaces/usecases/admin/IUpdateSubscriptionPlanStatusUsecase';
import {
    IGetSubscribedUsersOutputDto,
    IGetSubscriptionFeaturesOutputDto,
    IGetSubscriptionPlansOutputDto,
    ISubscriptionPlanDto,
} from '@application/dtos/admin/subscription.dto';
import {
    updateSubscriptionPlanStatusSchema,
    ZodUpdateSubscriptionPlanStatusInputType,
} from '@presentation/validators/schemas/admin/updateSubscriptionPlanStatus.schema';
import {
    updateSubscriptionPlanSchema,
    ZodUpdateSubscriptionPlanInputType,
} from '@presentation/validators/schemas/admin/updateSubscriptionPlan.schema';
import { IUpdateSubscriptionPlanUsecase } from '@application/interfaces/usecases/admin/IUpdateSubscriptionPlanUsecase';
import { IGetSystemConfigsOutputDto } from '@application/dtos/admin/systemConfig.dto';

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
        @inject(TYPES.IEditSystemConfigUsecase)
        private readonly _editSystemConfigUsecase: IEditSystemConfigUsecase,
        @inject(TYPES.ICreateSubscriptionPlanUsecase)
        private readonly _createSubscriptionPlanUsecase: ICreateSubscriptionPlanUsecase,
        @inject(TYPES.IGetSubscriptionPlansUsecase)
        private readonly _getSubscriptionPlansUsecase: IGetSubscriptionPlansUsecase,
        @inject(TYPES.IGetSubscribedUsersUsecase)
        private readonly _getSubscribedUsersUsecase: IGetSubscribedUsersUsecase,
        @inject(TYPES.IGetSubscriptionFeaturesUsecase)
        private readonly _getSubscriptionFeaturesUsecase: IGetSubscriptionFeaturesUsecase,
        @inject(TYPES.IUpdateSubscriptionPlanStatusUsecase)
        private readonly _updateSubscriptionPlanStatusUsecase: IUpdateSubscriptionPlanStatusUsecase,
        @inject(TYPES.IUpdateSubscriptionPlanUsecase)
        private readonly _updateSubscriptionPlanUsecase: IUpdateSubscriptionPlanUsecase,
    ) {}

    /**
     * Paginated list of platform users with filters from `query`.
     *
     * @param req - Express request; `query` validated with `getAllUsersSchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after user list payload is sent
     * @throws {AppError} When validation fails or fetch fails
     */
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

    /**
     * Blocks or unblocks a user per validated `body`.
     *
     * @param req - Express request; `body` validated with `blockUserSchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after block result is sent
     * @throws {AppError} When validation fails or the use case fails
     */
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

    /**
     * Fetches a single user record for admin review by `req.params.id`.
     *
     * @param req - Express request; `params.id` validated via `getAdminUserSchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after user detail is sent
     * @throws {AppError} When validation fails or user is not found
     */
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

    /**
     * Paginated list of sellers with filters from `query`.
     *
     * @param req - Express request; `query` validated with `getAllSellersSchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after seller list is sent
     * @throws {AppError} When validation fails or fetch fails
     */
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

    /**
     * High-level counts and aggregates for the admin dashboard home.
     *
     * @param req - Express request (unused)
     * @param res - Express response for JSON output
     * @returns Promise that settles after stats DTO is sent
     * @throws {AppError} When aggregation fails
     */
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

    /**
     * Loads seller profile and related admin data by `req.params.id`.
     *
     * @param req - Express request; `params.id` wrapped for `getAdminSellerSchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after seller detail is sent
     * @throws {AppError} When validation fails or seller is not found
     */
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

    /**
     * Approves seller KYC for the seller id in `req.params.id`.
     *
     * @param req - Express request; `params.id` validated with `getAdminSellerSchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after approval payload is sent
     * @throws {AppError} When validation fails or approval is rejected by rules
     */
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

    /**
     * Rejects seller KYC with a reason for the seller id in `req.params.id`.
     *
     * @param req - Express request; route id + `body.reason` validated with `rejectSellerKycSchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after rejection payload is sent
     * @throws {AppError} When validation fails or rejection fails
     */
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

    /**
     * Lists pending and historical auction category requests from sellers.
     *
     * @param req - Express request (unused)
     * @param res - Express response for JSON output
     * @returns Promise that settles after requests payload is sent
     * @throws {AppError} When fetch fails
     */
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

    /**
     * Approves a seller-requested auction category by `req.params.id`.
     *
     * @param req - Express request; `params.id` validated with `approveAuctionCategorySchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after approval DTO is sent
     * @throws {AppError} When validation fails or approval fails
     */
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

    /**
     * Rejects a category request with reason (`req.params.id` + `body.reason`).
     *
     * @param req - Express request validated with `rejectAuctionCategorySchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after rejection DTO is sent
     * @throws {AppError} When validation fails or rejection fails
     */
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

    /**
     * Changes active/disabled (or similar) status on an auction category.
     *
     * @param req - Express request; route id + `body.status` validated with `changeAuctionCategoryStatusSchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after status DTO is sent
     * @throws {AppError} When validation fails or update fails
     */
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

    /**
     * Lists all admin-managed auction categories (tree/flat per use case output).
     *
     * @param req - Express request (unused)
     * @param res - Express response for JSON output
     * @returns Promise that settles after categories payload is sent
     * @throws {AppError} When fetch fails
     */
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

    /**
     * Admin browse of auctions with filters (same shape as user browse, scoped for admins).
     *
     * @param req - Express request; `query` merged with admin `userId`, validated with `getBrowseAuctionsSchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after listings page is sent
     * @throws {AppError} When `req.user` is missing, validation fails, or fetch fails
     */
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

    /**
     * Updates name/parent fields on an auction category identified by `req.params.id`.
     *
     * @param req - Express request; `body` + route id validated with `UpdateAuctionCategorySchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after updated category is sent
     * @throws {AppError} When `req.user` is missing, validation fails, or update fails
     */
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

    /**
     * Creates a new global auction category (optionally under a parent).
     *
     * @param req - Express request; `body` merged with admin `userId`, validated with `createAuctionCategorySchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after created category is sent
     * @throws {AppError} When `req.user` is missing, validation fails, or create fails
     */
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

    /**
     * Streams a KYC document for admin review (binary pipe to `res`).
     *
     * @param req - Express request; `params.id` as document id, `user` from auth middleware
     * @param res - Express response receiving the document stream
     * @returns Promise that settles after the stream is piped or errors
     * @throws {AppError} When `req.user` is missing, validation fails, or document cannot be opened
     */
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

    /**
     * Returns all system configuration key/value rows for admin UI.
     *
     * @param req - Express request (unused)
     * @param res - Express response for JSON output
     * @returns Promise that settles after configs are sent
     * @throws {AppError} When fetch fails
     */
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

    /**
     * Updates a single system config entry from validated `body`.
     *
     * @param req - Express request; `body` validated with `editSystemConfigSchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after updated row is sent
     * @throws {AppError} When validation fails or update fails
     */
    updateSystemConfig = expressAsyncHandler(
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

    /**
     * Creates a subscription plan from validated `body` (pricing, features linkage, etc.).
     *
     * @param req - Express request; `body` validated with `createSubscriptionPlanSchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after plan DTO is sent
     * @throws {AppError} When validation fails or create fails
     */
    createSubscriptionPlan = expressAsyncHandler(
        async (req: Request, res: Response) => {
            console.log(req.body);

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

    /**
     * Lists subscription plans for admin management UI.
     *
     * @param req - Express request (unused)
     * @param res - Express response for JSON output
     * @returns Promise that settles after plans payload is sent
     * @throws {AppError} When fetch fails
     */
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

    /**
     * Updates default/active flags on a plan identified by `req.params.id`.
     *
     * @param req - Express request; route id + `body` validated with `updateSubscriptionPlanStatusSchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after updated plan is sent
     * @throws {AppError} When validation fails or update fails
     */
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

    /**
     * Lists users with an active subscription (admin reporting).
     *
     * @param req - Express request (unused)
     * @param res - Express response for JSON output
     * @returns Promise that settles after subscribed users payload is sent
     * @throws {AppError} When fetch fails
     */
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

    /**
     * Lists subscription feature definitions usable when composing plans.
     *
     * @param req - Express request (unused)
     * @param res - Express response for JSON output
     * @returns Promise that settles after features payload is sent
     * @throws {AppError} When fetch fails
     */
    getSubscriptionFeatures = expressAsyncHandler(
        async (_req: Request, res: Response) => {
            const result = await this._getSubscriptionFeaturesUsecase.execute();

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    ADMIN_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<IGetSubscriptionFeaturesOutputDto>(
                res,
                result.getValue(),
                ADMIN_CONSTANTS.MESSAGES.GET_SUBSCRIPTION_FEATURES_SUCCESSFULLY,
                ADMIN_CONSTANTS.CODES.OK,
            );
        },
    );

    /**
     * Updates editable fields on a subscription plan from validated `body`.
     *
     * @param req - Express request; `body` validated with `updateSubscriptionPlanSchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after updated plan is sent
     * @throws {AppError} When validation fails or update fails
     */
    updateSubscriptionPlan = expressAsyncHandler(
        async (req: Request, res: Response) => {
            const validationResult =
                ValidationHelper.validate<ZodUpdateSubscriptionPlanInputType>(
                    updateSubscriptionPlanSchema,
                    req.body,
                );

            const result =
                await this._updateSubscriptionPlanUsecase.execute(
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
                ADMIN_CONSTANTS.MESSAGES.UPDATE_SUBSCRIPTION_PLAN_SUCCESSFULLY,
                ADMIN_CONSTANTS.CODES.OK,
            );
        },
    );
}
