import { IGetAllSellerAuctionCategoryRequestUsecase } from '@application/interfaces/usecases/seller/IGetAllAuctioncategoryRequestUsecase';
import { TYPES } from '@di/types.di';
import { SELLER_CONSTANTS } from '@presentation/constants/seller/seller.constants';
import expressAsyncHandler from 'express-async-handler';
import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { AppError } from '@presentation/http/error/app.error';
import {
    IGetAllAuctionCategoryRequestInputDto,
    IGetAllAuctionCategoryRequestOutputDto,
} from '@application/dtos/seller/getAllAuctionCategoryRequest.dto';
import {
    requestAuctionCategorySchema,
    ZodRequestAuctionCategoryInputType,
} from '@presentation/validators/schemas/seller/requestAuctionCategory.schema';
import { IRequestAuctionCategoryUsecase } from '@application/interfaces/usecases/seller/IRequestAuctionCategory.usecase';
import { IGetAllSellerAuctionsUsecase } from '@application/interfaces/usecases/seller/IGetallAuctionsUsecase';
import {
    IGetAllAuctionsInputDto,
    IGetAllAuctionsOutputDto,
} from '@application/dtos/auction/getAllAuction.dto';
import {
    getAllAuctionsSchema,
    ZodGetAllAuctionsInputType,
} from '@presentation/validators/schemas/seller/getAllAuctions.schema';
import { IGetAuctionByIdUsecase } from '@application/interfaces/usecases/auction/IGetAuctionByIdUsecase';
import { IGetSellerAuctionPaymentsUsecase } from '@application/interfaces/usecases/seller/IGetSellerAuctionPaymentsUsecase';
import { AUCTION_CONSTANTS } from '@presentation/constants/auction/auction.constants';
import { SellerMapperProfile } from '@infrastructure/mappers/seller/seller.mapper';
import { ResponseHelper } from '@presentation/http/helpers/response.helper';
import { ValidationHelper } from '@presentation/http/helpers/validation.helper';
import {
    IRequestAuctionCategoryInputDto,
    IRequestAuctionCategoryOutputDto,
} from '@application/dtos/admin/request-auction-category.dto';
import { IAuctionDto } from '@application/dtos/auction/auction.dto';
import { IGetSellerAuctionPaymentsOutputDto } from '@application/dtos/seller/sellerAuctionPayments.dto';
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
    ) {}

    getAllSellerAuctionCategory = expressAsyncHandler(
        async (req: Request, res: Response) => {
            if (!req.user) {
                throw new AppError(
                    SELLER_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                    SELLER_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            const dto: IGetAllAuctionCategoryRequestInputDto =
                SellerMapperProfile.toGetAllAuctionCategoryRequestInputDto(
                    req.user.id,
                );

            const result =
                await this._getAllSellerAuctionCategoryRequestUsecase.execute(
                    dto,
                );

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

            const dto: IRequestAuctionCategoryInputDto =
                SellerMapperProfile.toRequestAuctionCategoryInputDto(
                    validationResult,
                    req.user.id,
                );

            const result =
                await this._requestAuctionCategoryUsecase.execute(dto);

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
                    req.query,
                );

            const dto: IGetAllAuctionsInputDto =
                SellerMapperProfile.toGetAllAuctionsInputDto(
                    validationResult,
                    req.user.id,
                );

            const result = await this._getAllAuctionsUsecase.execute(dto);

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

            const dto = SellerMapperProfile.toGetAuctionByIdInputDto(
                auctionId,
                req.user.id,
            );

            const result = await this._getAuctionByIdUsecase.execute(dto);

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
}
