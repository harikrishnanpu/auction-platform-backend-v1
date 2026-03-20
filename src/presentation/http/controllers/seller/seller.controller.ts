import { IGetAllSellerAuctionCategoryRequestUsecase } from '@application/interfaces/usecases/seller/IGetAllAuctioncategoryRequestUsecase';
import { TYPES } from '@di/types.di';
import { SELLER_CONSTANTS } from '@presentation/constants/seller/seller.constants';
import expressAsyncHandler from 'express-async-handler';
import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { AppError } from '@presentation/http/error/app.error';
import { IGetAllAuctionCategoryRequestInputDto } from '@application/dtos/seller/getAllAuctionCategoryRequest.dto';
import { requestAuctionCategorySchema } from '@presentation/validators/schemas/seller/requestAuctionCategory.schema';
import { AuctionMapperProrfile } from '@application/mappers/auction/auction.mapperProfile';
import { IRequestAuctionCategoryUsecase } from '@application/interfaces/usecases/seller/IRequestAuctionCategory.usecase';
import { IGetAllSellerAuctionsUsecase } from '@application/interfaces/usecases/seller/IGetallAuctionsUsecase';
import { IGetAllAuctionsInputDto } from '@application/dtos/auction/getAllAuction.dto';
import { getAllAuctionsSchema } from '@presentation/validators/schemas/seller/getAllAuctions.schema';
import {
  AuctionStatus,
  AuctionType,
} from '@domain/entities/auction/auction.entity';
import { IGetAuctionByIdUsecase } from '@application/interfaces/usecases/auction/IGetAuctionByIdUsecase';
import { AUCTION_CONSTANTS } from '@presentation/constants/auction/auction.constants';

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
  ) {}

  getAllSellerAuctionCategory = expressAsyncHandler(
    async (req: Request, res: Response) => {
      if (!req.user) {
        throw new AppError(
          SELLER_CONSTANTS.MESSAGES.USER_NOT_FOUND,
          SELLER_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      const input: IGetAllAuctionCategoryRequestInputDto = {
        userId: req.user.id,
      };

      const result =
        await this._getAllSellerAuctionCategoryRequestUsecase.execute(input);

      if (result.isFailure) {
        throw new AppError(
          result.getError(),
          SELLER_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      res.status(SELLER_CONSTANTS.CODES.OK).json({
        data: result.getValue(),
        success: true,
        message:
          SELLER_CONSTANTS.MESSAGES
            .GET_ALL_SELLER_AUCTION_CATEGORY_SUCCESSFULLY,
        status: SELLER_CONSTANTS.CODES.OK,
        error: null,
      });
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

      const parsedResult = requestAuctionCategorySchema.safeParse(req.body);

      if (!parsedResult.success) {
        throw new AppError(
          parsedResult.error.issues[0].message,
          SELLER_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      const inputDto = AuctionMapperProrfile.toRequestAuctionCategoryDto(
        parsedResult.data,
        req.user.id,
      );

      const result =
        await this._requestAuctionCategoryUsecase.execute(inputDto);

      if (result.isFailure) {
        throw new AppError(
          result.getError(),
          SELLER_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      res.status(SELLER_CONSTANTS.CODES.OK).json({
        data: result.getValue(),
        success: true,
        message:
          SELLER_CONSTANTS.MESSAGES.ACTION_CATEGORY_REQUESTED_SUCCESSFULLY,
        status: SELLER_CONSTANTS.CODES.OK,
        error: null,
      });
    },
  );

  getAllAuctions = expressAsyncHandler(async (req: Request, res: Response) => {
    const parsedResult = getAllAuctionsSchema.safeParse(req.query);

    if (!parsedResult.success) {
      throw new AppError(
        parsedResult.error.issues[0].message,
        SELLER_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    if (!req.user) {
      throw new AppError(
        SELLER_CONSTANTS.MESSAGES.USER_NOT_FOUND,
        SELLER_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    const toDomainStatus = (status: string): AuctionStatus | 'ALL' => {
      if (status === 'PUBLISHED') return AuctionStatus.ACTIVE;
      if (status === 'COMPLETED') return AuctionStatus.ENDED;
      if (status === 'ALL') return 'ALL';
      return Object.values(AuctionStatus).includes(status as AuctionStatus)
        ? (status as AuctionStatus)
        : 'ALL';
    };

    const toDomainType = (auctionType: string): AuctionType | 'ALL' => {
      if (auctionType === 'ALL') return 'ALL';
      return Object.values(AuctionType).includes(auctionType as AuctionType)
        ? (auctionType as AuctionType)
        : 'ALL';
    };

    const input: IGetAllAuctionsInputDto = {
      userId: req.user.id,
      status: toDomainStatus(parsedResult.data.status ?? 'ALL'),
      auctionType: toDomainType(parsedResult.data.auctionType ?? 'ALL'),
      categoryId: parsedResult.data.categoryId ?? 'ALL',
      page: parseInt(parsedResult.data.page ?? '1'),
      limit: parseInt(parsedResult.data.limit ?? '10'),
      sort: parsedResult.data.sort ?? 'startAt',
      order: (parsedResult.data.order as 'asc' | 'desc') ?? 'desc',
      search: parsedResult.data.search ?? '',
    };

    const result = await this._getAllAuctionsUsecase.execute(input);

    if (result.isFailure) {
      throw new AppError(result.getError(), SELLER_CONSTANTS.CODES.BAD_REQUEST);
    }

    res.status(SELLER_CONSTANTS.CODES.OK).json({
      data: result.getValue(),
      success: true,
      message: SELLER_CONSTANTS.MESSAGES.GET_ALL_SELLER_AUCTIONS_SUCCESSFULLY,
      status: SELLER_CONSTANTS.CODES.OK,
      error: null,
    });
  });

  getSellerAuctionById = expressAsyncHandler(
    async (req: Request, res: Response) => {
      if (!req.user) {
        throw new AppError(
          SELLER_CONSTANTS.MESSAGES.USER_NOT_FOUND,
          SELLER_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      const auctionId = req.params.id;
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

      res.status(SELLER_CONSTANTS.CODES.OK).json({
        data: result.getValue(),
        success: true,
        message: AUCTION_CONSTANTS.MESSAGES.AUCTION_FETCHED_SUCCESSFULLY,
        status: SELLER_CONSTANTS.CODES.OK,
        error: null,
      });
    },
  );
}
