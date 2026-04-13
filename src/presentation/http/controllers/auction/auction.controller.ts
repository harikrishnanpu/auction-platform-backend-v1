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
import {
    getBrowseAuctionsSchema,
    ZodGetBrowseAuctionsInputType,
} from '@presentation/validators/schemas/auction/getBrowseAuctions.schema';
import { ResponseHelper } from '@presentation/http/helpers/response.helper';
import { IAuctionDto } from '@application/dtos/auction/auction.dto';
import { ValidationHelper } from '@presentation/http/helpers/validation.helper';
import {
    GetAllAuctionCategoryDto,
    IGetAllAuctionsOutputDto,
} from '@application/dtos/auction/getAllAuction.dto';
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
    ) {}

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
                req.body,
            );

        const result =
            await this._createAuctionUsecase.execute(validatedResult);

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
                    req.query as unknown as ZodGetBrowseAuctionsInputType,
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
                    req.body,
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

        const result =
            await this._updateAuctionUsecase.execute(validatedResult);

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
