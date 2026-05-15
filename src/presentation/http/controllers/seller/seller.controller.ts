import { IGetAllSellerAuctionCategoryRequestUsecase } from '@application/interfaces/usecases/seller/IGetAllAuctioncategoryRequestUsecase';
import { TYPES } from '@di/types.di';
import { SELLER_CONSTANTS } from '@presentation/constants/seller/seller.constants';
import expressAsyncHandler from 'express-async-handler';
import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { AppError } from '@presentation/http/error/app.error';
import { IGetAllAuctionCategoryRequestOutputDto } from '@application/dtos/seller/getAllAuctionCategoryRequest.dto';
import {
    requestAuctionCategorySchema,
    ZodRequestAuctionCategoryInputType,
} from '@presentation/validators/schemas/seller/requestAuctionCategory.schema';
import { IRequestAuctionCategoryUsecase } from '@application/interfaces/usecases/seller/IRequestAuctionCategory.usecase';
import { IGetAllSellerAuctionsUsecase } from '@application/interfaces/usecases/seller/IGetallAuctionsUsecase';
import { IGetAllAuctionsOutputDto } from '@application/dtos/auction/getAllAuction.dto';
import {
    getAllAuctionsSchema,
    ZodGetAllAuctionsInputType,
} from '@presentation/validators/schemas/seller/getAllAuctions.schema';
import { IGetAuctionByIdUsecase } from '@application/interfaces/usecases/auction/IGetAuctionByIdUsecase';
import { IGetSellerAuctionPaymentsUsecase } from '@application/interfaces/usecases/seller/IGetSellerAuctionPaymentsUsecase';
import { IGetSellerDashboardStatsUsecase } from '@application/interfaces/usecases/seller/IGetSellerDashboardStatsUsecase';
import { AUCTION_CONSTANTS } from '@presentation/constants/auction/auction.constants';
import { ResponseHelper } from '@presentation/http/helpers/response.helper';
import { ValidationHelper } from '@presentation/http/helpers/validation.helper';
import { IRequestAuctionCategoryOutputDto } from '@application/dtos/admin/request-auction-category.dto';
import { IAuctionDto } from '@application/dtos/auction/auction.dto';
import { IGetSellerAuctionPaymentsOutputDto } from '@application/dtos/seller/sellerAuctionPayments.dto';
import { ISellerDashboardStatsDto } from '@application/dtos/seller/sellerDashboardStats.dto';
import { AuctionMapperProrfile } from '@application/mappers/auction/auction.mapperProfile';
import { PaymentStatus } from '@domain/entities/payments/payments.entity';
import {
    getSellerAuctionPaymentsSchema,
    ZodGetSellerAuctionPaymentsInputType,
} from '@presentation/validators/schemas/seller/getSellerAuctionPayments.schema';

@injectable()
export class SellerController {
    constructor(
        @inject(TYPES.IGetAllSellerAuctionCategoryRequestUsecase)
        private readonly _getAllSellerAuctionCategoryRequestUsecase: IGetAllSellerAuctionCategoryRequestUsecase,
        @inject(TYPES.IRequestAuctionCategoryUsecase)
        private readonly _requestAuctionCategoryUsecase: IRequestAuctionCategoryUsecase,
        @inject(TYPES.IGetAllSellerAuctionsUsecase)
        private readonly _getAllAuctionsUsecase: IGetAllSellerAuctionsUsecase,
        @inject(TYPES.IGetAuctionByIdUsecase)
        private readonly _getAuctionByIdUsecase: IGetAuctionByIdUsecase,
        @inject(TYPES.IGetSellerAuctionPaymentsUsecase)
        private readonly _getSellerAuctionPaymentsUsecase: IGetSellerAuctionPaymentsUsecase,
        @inject(TYPES.IGetSellerDashboardStatsUsecase)
        private readonly _getSellerDashboardStatsUsecase: IGetSellerDashboardStatsUsecase,
    ) {}

    /**
     * Lists this seller's auction category requests and their statuses.
     *
     * @param req - Express request with authenticated `user`
     * @param res - Express response for JSON output
     * @returns Promise that settles after request list is sent
     * @throws {AppError} When `req.user` is missing or fetch fails
     */
    getAllSellerAuctionCategory = expressAsyncHandler(
        async (req: Request, res: Response) => {
            if (!req.user) {
                throw new AppError(
                    SELLER_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                    SELLER_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            const result =
                await this._getAllSellerAuctionCategoryRequestUsecase.execute({
                    userId: req.user.id,
                });

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    SELLER_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<IGetAllAuctionCategoryRequestOutputDto>(
                res,
                result.getValue(),
                SELLER_CONSTANTS.MESSAGES
                    .GET_ALL_SELLER_AUCTION_CATEGORY_SUCCESSFULLY,
                SELLER_CONSTANTS.CODES.OK,
            );
        },
    );

    /**
     * Submits a new custom auction category request for the authenticated seller.
     *
     * @param req - Express request; `body` validated with `requestAuctionCategorySchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after created request DTO is sent
     * @throws {AppError} When `req.user` is missing, validation fails, or create fails
     */
    requestAuctionCategory = expressAsyncHandler(
        async (req: Request, res: Response) => {
            if (!req.user) {
                throw new AppError(
                    SELLER_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                    SELLER_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            const validationResult =
                ValidationHelper.validate<ZodRequestAuctionCategoryInputType>(
                    requestAuctionCategorySchema,
                    req.body,
                );

            const result = await this._requestAuctionCategoryUsecase.execute(
                AuctionMapperProrfile.toRequestAuctionCategoryDto(
                    validationResult,
                    req.user.id,
                ),
            );

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    SELLER_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<IRequestAuctionCategoryOutputDto>(
                res,
                result.getValue(),
                SELLER_CONSTANTS.MESSAGES
                    .ACTION_CATEGORY_REQUESTED_SUCCESSFULLY,
                SELLER_CONSTANTS.CODES.OK,
            );
        },
    );

    /**
     * Paginated list of auctions owned by the authenticated seller (`query` filters).
     *
     * @param req - Express request; `query` merged with `userId`, validated with `getAllAuctionsSchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after listings page is sent
     * @throws {AppError} When `req.user` is missing, validation fails, or fetch fails
     */
    getAllAuctions = expressAsyncHandler(
        async (req: Request, res: Response) => {
            if (!req.user) {
                throw new AppError(
                    SELLER_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                    SELLER_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            const validationResult =
                ValidationHelper.validate<ZodGetAllAuctionsInputType>(
                    getAllAuctionsSchema,
                    {
                        ...req.query,
                        userId: req.user.id,
                    } as unknown as ZodGetAllAuctionsInputType,
                );

            const result =
                await this._getAllAuctionsUsecase.execute(validationResult);

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    SELLER_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<IGetAllAuctionsOutputDto>(
                res,
                result.getValue(),
                SELLER_CONSTANTS.MESSAGES.GET_ALL_SELLER_AUCTIONS_SUCCESSFULLY,
                SELLER_CONSTANTS.CODES.OK,
            );
        },
    );

    /**
     * Loads one seller auction by `req.params.id` for the authenticated owner.
     *
     * @param req - Express request; `params.id` is auction id; `user` from auth middleware
     * @param res - Express response for JSON output
     * @returns Promise that settles after auction DTO is sent
     * @throws {AppError} When user missing, id missing, or fetch fails
     */
    getSellerAuctionById = expressAsyncHandler(
        async (req: Request, res: Response) => {
            if (!req.user) {
                throw new AppError(
                    SELLER_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                    SELLER_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            const auctionId = req.params.id as string;

            if (!auctionId) {
                throw new AppError(
                    'Auction id is required',
                    SELLER_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            const result = await this._getAuctionByIdUsecase.execute({
                userId: req.user.id,
                auctionId,
            });

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    SELLER_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<IAuctionDto>(
                res,
                result.getValue(),
                AUCTION_CONSTANTS.MESSAGES.AUCTION_FETCHED_SUCCESSFULLY,
                SELLER_CONSTANTS.CODES.OK,
            );
        },
    );

    /**
     * Paginated buyer payment requests tied to the seller's auctions.
     *
     * @param req - Express request; `query` validated with `getSellerAuctionPaymentsSchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after payments page is sent
     * @throws {AppError} When `req.user` is missing, validation fails, or fetch fails
     */
    getSellerAuctionPayments = expressAsyncHandler(
        async (req: Request, res: Response) => {
            if (!req.user) {
                throw new AppError(
                    SELLER_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                    SELLER_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            const validationResult =
                ValidationHelper.validate<ZodGetSellerAuctionPaymentsInputType>(
                    getSellerAuctionPaymentsSchema,
                    req.query,
                );

            const result = await this._getSellerAuctionPaymentsUsecase.execute({
                sellerId: req.user.id,
                status: validationResult.status as PaymentStatus | 'ALL',
                page: Number(validationResult.page),
                limit: Number(validationResult.limit),
            });

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    SELLER_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<IGetSellerAuctionPaymentsOutputDto>(
                res,
                result.getValue(),
                SELLER_CONSTANTS.MESSAGES
                    .GET_SELLER_AUCTION_PAYMENTS_SUCCESSFULLY,
                SELLER_CONSTANTS.CODES.OK,
            );
        },
    );

    /**
     * Aggregated dashboard metrics (auctions, payments) for the authenticated seller.
     *
     * @param req - Express request with authenticated `user`
     * @param res - Express response for JSON output
     * @returns Promise that settles after stats DTO is sent
     * @throws {AppError} When `req.user` is missing or aggregation fails
     */
    getSellerDashboardStats = expressAsyncHandler(
        async (req: Request, res: Response) => {
            if (!req.user) {
                throw new AppError(
                    SELLER_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                    SELLER_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            const result = await this._getSellerDashboardStatsUsecase.execute({
                sellerId: req.user.id,
            });

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    SELLER_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<ISellerDashboardStatsDto>(
                res,
                result.getValue(),
                SELLER_CONSTANTS.MESSAGES
                    .GET_SELLER_DASHBOARD_STATS_SUCCESSFULLY,
                SELLER_CONSTANTS.CODES.OK,
            );
        },
    );
}
