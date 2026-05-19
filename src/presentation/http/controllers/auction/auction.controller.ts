import { ICreateAuctionUsecase } from '@application/interfaces/usecases/auction/ICreateAuctionUsecase';
import { IGenerateAuctionUploadUrlUsecase } from '@application/interfaces/usecases/auction/IGenerateAuctionUploadUrlUsecase';
import { IUpdateAuctionUsecase } from '@application/interfaces/usecases/auction/IUpdateAuctionUsecase';
import { IPublishAuctionUsecase } from '@application/interfaces/usecases/auction/IPublishAuctionUsecase';
import { IUpdateAuctionOutput } from '@application/dtos/auction/update-auction.dto';
import { TYPES } from '@di/types.di';
import {
    generateAuctionUploadUrlSchema,
    ZodGenerateAuctionUploadUrlInputType,
} from '@presentation/validators/schemas/auction/generateAuctionUploadUrl.schema';
import {
    updateAuctionSchema,
    ZodUpdateAuctionInputType,
} from '@presentation/validators/schemas/auction/updateAuction.schema';
import { AUCTION_CONSTANTS } from '@presentation/constants/auction/auction.constants';
import { AppError } from '@presentation/http/error/app.error';
import {
    createAuctionSchema,
    ZodCreateAuctionInputType,
} from '@presentation/validators/schemas/auction/createAuction.schema';
import expressAsyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import {
    publishAuctionParamsSchema,
    ZodPublishAuctionParamsInputType,
} from '@presentation/validators/schemas/auction/publishAuctionParams.schema';
import { IGetAllAuctionCategoriesUsecase } from '@application/interfaces/usecases/auction/IGetAllAuctionCategoriesUsecase';
import { IGetAuctionByIdUsecase } from '@application/interfaces/usecases/auction/IGetAuctionByIdUsecase';
import { IGetBrowseAuctionsUsecase } from '@application/interfaces/usecases/auction/IGetBrowseAuctionsUsecase';
import { IGetUserHomeAuctionFeedUsecase } from '@application/interfaces/usecases/auction/IGetUserHomeAuctionFeedUsecase';
import { IGetAuctionBidsUsecase } from '@application/interfaces/usecases/auction/IGetAuctionBidsUsecase';
import type { IGetAuctionBidsOutputDto } from '@application/dtos/auction/getAuctionBids.dto';
import {
    getAuctionBidsParamsSchema,
    ZodGetAuctionBidsParamsInputType,
} from '@presentation/validators/schemas/auction/getAuctionBidsParams.schema';
import {
    getBrowseAuctionsSchema,
    ZodGetBrowseAuctionsInputType,
} from '@presentation/validators/schemas/auction/getBrowseAuctions.schema';
import {
    getUserHomeAuctionFeedQuerySchema,
    ZodGetUserHomeAuctionFeedQueryType,
} from '@presentation/validators/schemas/auction/getUserHomeAuctionFeed.schema';
import { ResponseHelper } from '@presentation/http/helpers/response.helper';
import { IAuctionDto } from '@application/dtos/auction/auction.dto';
import { ValidationHelper } from '@presentation/http/helpers/validation.helper';
import {
    GetAllAuctionCategoryDto,
    IGetAllAuctionsOutputDto,
} from '@application/dtos/auction/getAllAuction.dto';
import { IGetUserHomeAuctionFeedOutputDto } from '@application/dtos/auction/getUserHomeAuctionFeed.dto';
import { IGenerateAuctionUploadUrlOutput } from '@application/dtos/auction/generate-auction-upload-url.dto';
import { IPublishAuctionOutput } from '@application/dtos/auction/publish-auction.dto';

@injectable()
export class AuctionController {
    constructor(
        @inject(TYPES.ICreateAuctionUsecase)
        private readonly _createAuctionUsecase: ICreateAuctionUsecase,
        @inject(TYPES.IGenerateAuctionUploadUrlUsecase)
        private readonly _generateAuctionUploadUrlUsecase: IGenerateAuctionUploadUrlUsecase,
        @inject(TYPES.IUpdateAuctionUsecase)
        private readonly _updateAuctionUsecase: IUpdateAuctionUsecase,
        @inject(TYPES.IPublishAuctionUsecase)
        private readonly _publishAuctionUsecase: IPublishAuctionUsecase,
        @inject(TYPES.IGetAllAuctionCategoriesUsecase)
        private readonly _getAllAuctionCategoryUsecase: IGetAllAuctionCategoriesUsecase,
        @inject(TYPES.IGetAuctionByIdUsecase)
        private readonly _getAuctionByIdUsecase: IGetAuctionByIdUsecase,
        @inject(TYPES.IGetBrowseAuctionsUsecase)
        private readonly _getBrowseAuctionsUsecase: IGetBrowseAuctionsUsecase,
        @inject(TYPES.IGetUserHomeAuctionFeedUsecase)
        private readonly _getUserHomeAuctionFeedUsecase: IGetUserHomeAuctionFeedUsecase,
        @inject(TYPES.IGetAuctionBidsUsecase)
        private readonly _getAuctionBidsUsecase: IGetAuctionBidsUsecase,
    ) {}

    /**
     * Creates a draft auction for the authenticated seller from validated `req.body`.
     *
     * @param req - Express request; `body` merged with `userId` and validated with `createAuctionSchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after created auction DTO is sent
     * @throws {AppError} When `req.user` is missing, validation fails, or create fails
     */
    createAuction = expressAsyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            throw new AppError(
                AUCTION_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                AUCTION_CONSTANTS.CODES.BAD_REQUEST,
            );
        }

        console.log('ETTSTS: ', req.body);

        const validatedResult =
            ValidationHelper.validate<ZodCreateAuctionInputType>(
                createAuctionSchema,
                {
                    ...req.body,
                    userId: req.user.id,
                },
            );

        const result = await this._createAuctionUsecase.execute({
            ...validatedResult,
            startAt: new Date(validatedResult.startAt),
            endAt: new Date(validatedResult.endAt),
        });

        if (result.isFailure) {
            throw new AppError(
                result.getError(),
                AUCTION_CONSTANTS.CODES.BAD_REQUEST,
            );
        }

        ResponseHelper.success<IAuctionDto>(
            res,
            result.getValue(),
            AUCTION_CONSTANTS.MESSAGES.AUCTION_CREATED_SUCCESSFULLY,
            AUCTION_CONSTANTS.CODES.OK,
        );
    });

    /**
     * Lists all auction categories (browse filters and seller create flows).
     *
     * @param req - Express request (unused; kept for handler signature consistency)
     * @param res - Express response for JSON output
     * @returns Promise that settles after category list is sent
     * @throws {AppError} When the use case fails
     */
    getAllAuctionCategories = expressAsyncHandler(
        async (req: Request, res: Response) => {
            const result = await this._getAllAuctionCategoryUsecase.execute();

            if (result.isFailure) {
                console.log(result.getError());
                throw new AppError(
                    result.getError(),
                    AUCTION_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<GetAllAuctionCategoryDto>(
                res,
                result.getValue(),
                AUCTION_CONSTANTS.MESSAGES
                    .AUCTION_CATEGORIES_FETCHED_SUCCESSFULLY,
                AUCTION_CONSTANTS.CODES.OK,
            );
        },
    );

    /**
     * Paginated browse/search of auctions for the authenticated user.
     *
     * @param req - Express request; `query` merged with `userId` and validated with `getBrowseAuctionsSchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after listings page is sent
     * @throws {AppError} When `req.user` is missing, validation fails, or browse fails
     */
    getBrowseAuctions = expressAsyncHandler(
        async (req: Request, res: Response) => {
            if (!req.user) {
                throw new AppError(
                    AUCTION_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                    AUCTION_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            const validatedResult =
                ValidationHelper.validate<ZodGetBrowseAuctionsInputType>(
                    getBrowseAuctionsSchema,
                    {
                        ...req.query,
                        userId: req.user.id,
                    } as unknown as ZodGetBrowseAuctionsInputType,
                );

            const result =
                await this._getBrowseAuctionsUsecase.execute(validatedResult);

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    AUCTION_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<IGetAllAuctionsOutputDto>(
                res,
                result.getValue(),
                AUCTION_CONSTANTS.MESSAGES.AUCTION_FETCHED_SUCCESSFULLY,
                AUCTION_CONSTANTS.CODES.OK,
            );
        },
    );

    getUserHomeAuctionFeed = expressAsyncHandler(
        async (req: Request, res: Response) => {
            if (!req.user) {
                throw new AppError(
                    AUCTION_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                    AUCTION_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            const validatedResult =
                ValidationHelper.validate<ZodGetUserHomeAuctionFeedQueryType>(
                    getUserHomeAuctionFeedQuerySchema,
                    req.query as unknown as ZodGetUserHomeAuctionFeedQueryType,
                );

            const result = await this._getUserHomeAuctionFeedUsecase.execute({
                liveLimit: validatedResult.liveLimit,
                longSealedLimit: validatedResult.longSealedLimit,
            });

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    AUCTION_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<IGetUserHomeAuctionFeedOutputDto>(
                res,
                result.getValue(),
                AUCTION_CONSTANTS.MESSAGES.AUCTION_FETCHED_SUCCESSFULLY,
                AUCTION_CONSTANTS.CODES.OK,
            );
        },
    );

    /**
     * Fetches one auction by `req.params.id` for the authenticated user.
     *
     * @param req - Express request; `params.id` is auction id, `user` from auth middleware
     * @param res - Express response for JSON output
     * @returns Promise that settles after auction DTO is sent
     * @throws {AppError} When user missing, id invalid, or use case denies access / not found
     */
    getAuctionBids = expressAsyncHandler(
        async (req: Request, res: Response) => {
            if (!req.user) {
                throw new AppError(
                    AUCTION_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                    AUCTION_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            const validatedResult =
                ValidationHelper.validate<ZodGetAuctionBidsParamsInputType>(
                    getAuctionBidsParamsSchema,
                    {
                        id: req.params.id as string,
                        userId: req.user.id,
                    },
                );

            const result = await this._getAuctionBidsUsecase.execute({
                auctionId: validatedResult.id,
                userId: validatedResult.userId,
            });

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    AUCTION_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<IGetAuctionBidsOutputDto>(
                res,
                result.getValue(),
                AUCTION_CONSTANTS.MESSAGES.AUCTION_BIDS_FETCHED_SUCCESSFULLY,
                AUCTION_CONSTANTS.CODES.OK,
            );
        },
    );

    getAuctionById = expressAsyncHandler(
        async (req: Request, res: Response) => {
            if (!req.user) {
                throw new AppError(
                    AUCTION_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                    AUCTION_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            const id = req.params.id as string;

            if (!id.trim()) {
                throw new AppError(
                    AUCTION_CONSTANTS.MESSAGES.AUCTION_NOT_FOUND,
                    AUCTION_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            const result = await this._getAuctionByIdUsecase.execute({
                auctionId: id,
                userId: req.user.id,
            });

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    AUCTION_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<IAuctionDto>(
                res,
                result.getValue(),
                AUCTION_CONSTANTS.MESSAGES.AUCTION_FETCHED_SUCCESSFULLY,
                AUCTION_CONSTANTS.CODES.OK,
            );
        },
    );

    /**
     * Issues upload credentials / URL for an auction media asset.
     *
     * @param req - Express request; `body` merged with `userId` and validated with `generateAuctionUploadUrlSchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after upload URL payload is sent
     * @throws {AppError} When `req.user` is missing, validation fails, or URL generation fails
     */
    generateUploadUrl = expressAsyncHandler(
        async (req: Request, res: Response) => {
            if (!req.user) {
                console.log('USER NOT FOUND');
                throw new AppError(
                    AUCTION_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                    AUCTION_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            const validatedResult =
                ValidationHelper.validate<ZodGenerateAuctionUploadUrlInputType>(
                    generateAuctionUploadUrlSchema,
                    {
                        ...req.body,
                        userId: req.user.id,
                    },
                );

            const result =
                await this._generateAuctionUploadUrlUsecase.execute(
                    validatedResult,
                );

            if (result.isFailure) {
                console.log(result.getError());
                throw new AppError(
                    result.getError(),
                    AUCTION_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            console.log(result.getValue());

            ResponseHelper.success<IGenerateAuctionUploadUrlOutput>(
                res,
                result.getValue(),
                AUCTION_CONSTANTS.MESSAGES.UPLOAD_URL_GENERATED,
                AUCTION_CONSTANTS.CODES.OK,
            );
        },
    );

    /**
     * Updates a draft auction identified by `req.params.id` for the owning user.
     *
     * @param req - Express request; `body` + route `id` + `userId` validated with `updateAuctionSchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after update DTO is sent
     * @throws {AppError} When user missing, id missing, validation fails, or update fails
     */
    updateAuction = expressAsyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            throw new AppError(
                AUCTION_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                AUCTION_CONSTANTS.CODES.BAD_REQUEST,
            );
        }

        const id = req.params.id as string;

        if (!id) {
            throw new AppError(
                AUCTION_CONSTANTS.MESSAGES.AUCTION_NOT_FOUND,
                AUCTION_CONSTANTS.CODES.BAD_REQUEST,
            );
        }

        const validatedResult =
            ValidationHelper.validate<ZodUpdateAuctionInputType>(
                updateAuctionSchema,
                {
                    ...req.body,
                    userId: req.user.id,
                    auctionId: id,
                },
            );

        const result = await this._updateAuctionUsecase.execute({
            ...validatedResult,
            startAt: new Date(validatedResult.startAt),
            endAt: new Date(validatedResult.endAt),
        });

        if (result.isFailure) {
            console.log(result.getError());
            throw new AppError(
                result.getError(),
                AUCTION_CONSTANTS.CODES.BAD_REQUEST,
            );
        }

        ResponseHelper.success<IUpdateAuctionOutput>(
            res,
            result.getValue(),
            AUCTION_CONSTANTS.MESSAGES.AUCTION_UPDATED_SUCCESSFULLY,
            AUCTION_CONSTANTS.CODES.OK,
        );
    });

    /**
     * Publishes a draft auction so it follows visibility rules for buyers.
     *
     * @param req - Express request; `params.id` and `userId` validated with `publishAuctionParamsSchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after publish result is sent
     * @throws {AppError} When `req.user` is missing, validation fails, or publish is rejected
     */
    publishAuction = expressAsyncHandler(
        async (req: Request, res: Response) => {
            if (!req.user) {
                throw new AppError(
                    AUCTION_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                    AUCTION_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            const validatedResult =
                ValidationHelper.validate<ZodPublishAuctionParamsInputType>(
                    publishAuctionParamsSchema,
                    {
                        id: req.params.id as string,
                        userId: req.user.id,
                    },
                );

            const result =
                await this._publishAuctionUsecase.execute(validatedResult);

            if (result.isFailure) {
                console.log(result.getError());

                throw new AppError(
                    result.getError(),
                    AUCTION_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<IPublishAuctionOutput>(
                res,
                result.getValue(),
                AUCTION_CONSTANTS.MESSAGES.AUCTION_PUBLISHED_SUCCESSFULLY,
                AUCTION_CONSTANTS.CODES.OK,
            );
        },
    );
}
