import { ICreateAuctionInput } from '@application/dtos/auction/create-auction.dto';
import { AuctionAssetType } from '@domain/entities/auction/auction-asset.entity';
import { AuctionType } from '@domain/entities/auction/auction.entity';
import { ICreateAuctionUsecase } from '@application/interfaces/usecases/auction/ICreateAuctionUsecase';
import { IGetSellerAuctionsUsecase } from '@application/interfaces/usecases/auction/IGetSellerAuctionsUsecase';
import { IGetAuctionByIdUsecase } from '@application/interfaces/usecases/auction/IGetAuctionByIdUsecase';
import { IGetBrowseAuctionsUsecase } from '@application/interfaces/usecases/auction/IGetBrowseAuctionsUsecase';
import { IGenerateAuctionUploadUrlUsecase } from '@application/interfaces/usecases/auction/IGenerateAuctionUploadUrlUsecase';
import { IUpdateAuctionUsecase } from '@application/interfaces/usecases/auction/IUpdateAuctionUsecase';
import { IPublishAuctionUsecase } from '@application/interfaces/usecases/auction/IPublishAuctionUsecase';
import { IUpdateAuctionInput } from '@application/dtos/auction/update-auction.dto';
import { TYPES } from '@di/types.di';
import { generateAuctionUploadUrlSchema } from '@presentation/validators/schemas/auction/generateAuctionUploadUrl.schema';
import { updateAuctionSchema } from '@presentation/validators/schemas/auction/updateAuction.schema';
import { AUCTION_CONSTANTS } from '@presentation/constants/auction/auction.constants';
import { AppError } from '@presentation/http/error/app.error';
import { createAuctionSchema } from '@presentation/validators/schemas/auction/createAuction.schema';
import expressAsyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';

@injectable()
export class AuctionController {
  constructor(
    @inject(TYPES.ICreateAuctionUsecase)
    private readonly _createAuctionUsecase: ICreateAuctionUsecase,
    @inject(TYPES.IGetSellerAuctionsUsecase)
    private readonly _getSellerAuctionsUsecase: IGetSellerAuctionsUsecase,
    @inject(TYPES.IGetAuctionByIdUsecase)
    private readonly _getAuctionByIdUsecase: IGetAuctionByIdUsecase,
    @inject(TYPES.IGenerateAuctionUploadUrlUsecase)
    private readonly _generateAuctionUploadUrlUsecase: IGenerateAuctionUploadUrlUsecase,
    @inject(TYPES.IUpdateAuctionUsecase)
    private readonly _updateAuctionUsecase: IUpdateAuctionUsecase,
    @inject(TYPES.IGetBrowseAuctionsUsecase)
    private readonly _getBrowseAuctionsUsecase: IGetBrowseAuctionsUsecase,
    @inject(TYPES.IPublishAuctionUsecase)
    private readonly _publishAuctionUsecase: IPublishAuctionUsecase,
  ) {}

  createAuction = expressAsyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(
        AUCTION_CONSTANTS.MESSAGES.USER_NOT_FOUND,
        AUCTION_CONSTANTS.CODES.BAD_REQUEST,
      );
    }
    const parsed = createAuctionSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues[0].message,
        AUCTION_CONSTANTS.CODES.BAD_REQUEST,
      );
    }
    const input: ICreateAuctionInput = {
      userId: req.user.id,
      auctionType: parsed.data.auctionType as AuctionType,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      condition: parsed.data.condition,
      startPrice: parsed.data.startPrice,
      minIncrement: parsed.data.minIncrement,
      startAt: new Date(parsed.data.startAt),
      endAt: new Date(parsed.data.endAt),
      antiSnipSeconds: parsed.data.antiSnipSeconds,
      maxExtensionCount: parsed.data.maxExtensionCount,
      bidCooldownSeconds: parsed.data.bidCooldownSeconds,
      assets: parsed.data.assets?.map((a) => ({
        fileKey: a.fileKey,
        position: a.position,
        assetType: a.assetType as AuctionAssetType | undefined,
      })),
    };
    const result = await this._createAuctionUsecase.execute(input);
    if (result.isFailure) {
      throw new AppError(
        result.getError(),
        AUCTION_CONSTANTS.CODES.BAD_REQUEST,
      );
    }
    res.status(AUCTION_CONSTANTS.CODES.OK).json({
      data: result.getValue(),
      success: true,
      message: AUCTION_CONSTANTS.MESSAGES.AUCTION_CREATED_SUCCESSFULLY,
      status: AUCTION_CONSTANTS.CODES.OK,
      error: null,
    });
  });

  getSellerAuctions = expressAsyncHandler(
    async (req: Request, res: Response) => {
      if (!req.user) {
        throw new AppError(
          AUCTION_CONSTANTS.MESSAGES.USER_NOT_FOUND,
          AUCTION_CONSTANTS.CODES.BAD_REQUEST,
        );
      }
      const result = await this._getSellerAuctionsUsecase.execute({
        sellerId: req.user.id,
      });
      if (result.isFailure) {
        throw new AppError(
          result.getError(),
          AUCTION_CONSTANTS.CODES.BAD_REQUEST,
        );
      }
      res.status(AUCTION_CONSTANTS.CODES.OK).json({
        data: result.getValue(),
        success: true,
        status: AUCTION_CONSTANTS.CODES.OK,
        error: null,
      });
    },
  );

  getBrowseAuctions = expressAsyncHandler(
    async (req: Request, res: Response) => {
      const category =
        typeof req.query.category === 'string' ? req.query.category : undefined;
      const auctionType =
        typeof req.query.auctionType === 'string' &&
        ['LONG', 'LIVE', 'SEALED'].includes(req.query.auctionType)
          ? (req.query.auctionType as AuctionType)
          : undefined;
      const result = await this._getBrowseAuctionsUsecase.execute({
        category,
        auctionType,
      });
      if (result.isFailure) {
        throw new AppError(
          result.getError(),
          AUCTION_CONSTANTS.CODES.BAD_REQUEST,
        );
      }
      res.status(AUCTION_CONSTANTS.CODES.OK).json({
        data: result.getValue(),
        success: true,
        status: AUCTION_CONSTANTS.CODES.OK,
        error: null,
      });
    },
  );

  getAuctionById = expressAsyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      throw new AppError(
        AUCTION_CONSTANTS.MESSAGES.AUCTION_NOT_FOUND,
        AUCTION_CONSTANTS.CODES.BAD_REQUEST,
      );
    }
    const result = await this._getAuctionByIdUsecase.execute({
      auctionId: id,
      userId: req.user?.id,
    });
    if (result.isFailure) {
      throw new AppError(result.getError(), AUCTION_CONSTANTS.CODES.NOT_FOUND);
    }
    res.status(AUCTION_CONSTANTS.CODES.OK).json({
      data: result.getValue(),
      success: true,
      status: AUCTION_CONSTANTS.CODES.OK,
      error: null,
    });
  });

  generateUploadUrl = expressAsyncHandler(
    async (req: Request, res: Response) => {
      if (!req.user) {
        console.log('USER NOT FOUND');
        throw new AppError(
          AUCTION_CONSTANTS.MESSAGES.USER_NOT_FOUND,
          AUCTION_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      const parsed = generateAuctionUploadUrlSchema.safeParse(req.body);
      if (!parsed.success) {
        console.log(parsed.error.issues);
        throw new AppError(
          parsed.error.issues[0].message,
          AUCTION_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      const result = await this._generateAuctionUploadUrlUsecase.execute({
        userId: req.user.id,
        fileName: parsed.data.fileName,
        contentType: parsed.data.contentType,
        fileSize: parsed.data.fileSize,
      });

      if (result.isFailure) {
        console.log(result.getError());
        throw new AppError(
          result.getError(),
          AUCTION_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      console.log(result.getValue());

      res.status(AUCTION_CONSTANTS.CODES.OK).json({
        data: result.getValue(),
        success: true,
        message: AUCTION_CONSTANTS.MESSAGES.UPLOAD_URL_GENERATED,
        status: AUCTION_CONSTANTS.CODES.OK,
        error: null,
      });
    },
  );

  updateAuction = expressAsyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(
        AUCTION_CONSTANTS.MESSAGES.USER_NOT_FOUND,
        AUCTION_CONSTANTS.CODES.BAD_REQUEST,
      );
    }
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      throw new AppError(
        AUCTION_CONSTANTS.MESSAGES.AUCTION_NOT_FOUND,
        AUCTION_CONSTANTS.CODES.BAD_REQUEST,
      );
    }
    const parsed = updateAuctionSchema.safeParse(req.body);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      const message = first.path?.length
        ? `${first.path.join('.')}: ${first.message}`
        : first.message;
      throw new AppError(message, AUCTION_CONSTANTS.CODES.BAD_REQUEST);
    }
    const input: IUpdateAuctionInput = {
      auctionId: id,
      userId: req.user.id,
      auctionType: parsed.data.auctionType as AuctionType | undefined,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      condition: parsed.data.condition,
      startPrice: parsed.data.startPrice,
      minIncrement: parsed.data.minIncrement,
      startAt: new Date(parsed.data.startAt),
      endAt: new Date(parsed.data.endAt),
      antiSnipSeconds: parsed.data.antiSnipSeconds,
      maxExtensionCount: parsed.data.maxExtensionCount,
      bidCooldownSeconds: parsed.data.bidCooldownSeconds,
    };
    const result = await this._updateAuctionUsecase.execute(input);
    if (result.isFailure) {
      throw new AppError(
        result.getError(),
        AUCTION_CONSTANTS.CODES.BAD_REQUEST,
      );
    }
    res.status(AUCTION_CONSTANTS.CODES.OK).json({
      data: result.getValue(),
      success: true,
      message: AUCTION_CONSTANTS.MESSAGES.AUCTION_UPDATED_SUCCESSFULLY,
      status: AUCTION_CONSTANTS.CODES.OK,
      error: null,
    });
  });

  publishAuction = expressAsyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(
        AUCTION_CONSTANTS.MESSAGES.USER_NOT_FOUND,
        AUCTION_CONSTANTS.CODES.BAD_REQUEST,
      );
    }
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      throw new AppError(
        AUCTION_CONSTANTS.MESSAGES.AUCTION_NOT_FOUND,
        AUCTION_CONSTANTS.CODES.BAD_REQUEST,
      );
    }
    const result = await this._publishAuctionUsecase.execute({
      auctionId: id,
      userId: req.user.id,
    });
    if (result.isFailure) {
      throw new AppError(
        result.getError(),
        AUCTION_CONSTANTS.CODES.BAD_REQUEST,
      );
    }
    res.status(AUCTION_CONSTANTS.CODES.OK).json({
      data: result.getValue(),
      success: true,
      message: AUCTION_CONSTANTS.MESSAGES.AUCTION_PUBLISHED_SUCCESSFULLY,
      status: AUCTION_CONSTANTS.CODES.OK,
      error: null,
    });
  });
}
