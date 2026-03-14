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
import { IEndAuctionUsecase } from '@application/interfaces/usecases/auction/IEndAuctionUsecase';
import { IPlaceBidUsecase } from '@application/interfaces/usecases/auction/IPlaceBidUsecase';
import { IGetAuctionRoomUsecase } from '@application/interfaces/usecases/auction/IGetAuctionRoomUsecase';
import { IUpdateAuctionInput } from '@application/dtos/auction/update-auction.dto';
import { TYPES } from '@di/types.di';
import { generateAuctionUploadUrlSchema } from '@presentation/validators/schemas/auction/generateAuctionUploadUrl.schema';
import { updateAuctionSchema } from '@presentation/validators/schemas/auction/updateAuction.schema';
import { AUCTION_CONSTANTS } from '@presentation/constants/auction/auction.constants';
import { STATUS_CODES } from '@presentation/constants/http/status.code';
import { AppError } from '@presentation/http/error/app.error';
import { createAuctionSchema } from '@presentation/validators/schemas/auction/createAuction.schema';
import expressAsyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { browseAuctionSchema } from '@presentation/validators/schemas/auction/browseAuction.schema';
import { placeBidSchema } from '@presentation/validators/schemas/auction/placeBid.schema';
import { publishAuctionParamsSchema } from '@presentation/validators/schemas/auction/publishAuction.schema';
import { IGetBrowseAuctionsInput } from '@application/dtos/auction/get-browse-auctions.dto';
import { IPlaceBidInput } from '@application/dtos/auction/place-bid.dto';

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
    @inject(TYPES.IEndAuctionUsecase)
    private readonly _endAuctionUsecase: IEndAuctionUsecase,
    @inject(TYPES.IPlaceBidUsecase)
    private readonly _placeBidUsecase: IPlaceBidUsecase,
    @inject(TYPES.IGetAuctionRoomUsecase)
    private readonly _getAuctionRoomUsecase: IGetAuctionRoomUsecase,
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

  getAuctionForSeller = expressAsyncHandler(
    async (req: Request, res: Response) => {
      if (!req.user) {
        throw new AppError(
          AUCTION_CONSTANTS.MESSAGES.USER_NOT_FOUND,
          AUCTION_CONSTANTS.CODES.BAD_REQUEST,
        );
      }
      const id = req.params.id;
      if (!id) {
        throw new AppError(
          AUCTION_CONSTANTS.MESSAGES.AUCTION_NOT_FOUND,
          AUCTION_CONSTANTS.CODES.BAD_REQUEST,
        );
      }
      const auctionResult = await this._getAuctionByIdUsecase.execute({
        auctionId: id as string,
        userId: req.user.id,
      });
      if (auctionResult.isFailure) {
        throw new AppError(
          auctionResult.getError(),
          AUCTION_CONSTANTS.CODES.NOT_FOUND,
        );
      }
      const auction = auctionResult.getValue();
      if (auction.sellerId !== req.user.id) {
        throw new AppError(
          AUCTION_CONSTANTS.MESSAGES.NOT_AUTHORIZED_TO_VIEW_AUCTION,
          STATUS_CODES.FORBIDDEN,
        );
      }
      const roomResult = await this._getAuctionRoomUsecase.execute({
        auctionId: id as string,
        sellerId: req.user.id,
      });
      const room = roomResult.isSuccess
        ? roomResult.getValue()
        : {
            bids: [],
            participants: [],
            lastBidTime: null,
          };
      res.status(AUCTION_CONSTANTS.CODES.OK).json({
        data: { auction, room },
        success: true,
        status: AUCTION_CONSTANTS.CODES.OK,
        error: null,
      });
    },
  );

  getAuctionForUser = expressAsyncHandler(
    async (req: Request, res: Response) => {
      const id = req.params.id;
      if (!id) {
        throw new AppError(
          AUCTION_CONSTANTS.MESSAGES.AUCTION_NOT_FOUND,
          AUCTION_CONSTANTS.CODES.BAD_REQUEST,
        );
      }
      const auctionResult = await this._getAuctionByIdUsecase.execute({
        auctionId: id as string,
      });
      if (auctionResult.isFailure) {
        throw new AppError(
          auctionResult.getError(),
          AUCTION_CONSTANTS.CODES.NOT_FOUND,
        );
      }
      const roomResult = await this._getAuctionRoomUsecase.execute({
        auctionId: id as string,
      });
      if (roomResult.isFailure) {
        throw new AppError(
          roomResult.getError(),
          AUCTION_CONSTANTS.CODES.NOT_FOUND,
        );
      }
      res.status(AUCTION_CONSTANTS.CODES.OK).json({
        data: {
          auction: auctionResult.getValue(),
          room: roomResult.getValue(),
        },
        success: true,
        status: AUCTION_CONSTANTS.CODES.OK,
        error: null,
      });
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

    const id = req.params.id;

    if (!id) {
      throw new AppError(
        AUCTION_CONSTANTS.MESSAGES.AUCTION_NOT_FOUND,
        AUCTION_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    const parsed = updateAuctionSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues[0].message,
        AUCTION_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    const input: IUpdateAuctionInput = {
      auctionId: id as string,
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

    const params = publishAuctionParamsSchema.safeParse(req.params);
    if (!params.success) {
      const message = params.error.issues[0]?.message ?? 'Invalid auction id';
      throw new AppError(message, AUCTION_CONSTANTS.CODES.BAD_REQUEST);
    }

    const result = await this._publishAuctionUsecase.execute({
      auctionId: params.data.id,
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

  endAuction = expressAsyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(
        AUCTION_CONSTANTS.MESSAGES.USER_NOT_FOUND,
        AUCTION_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    const id = req.params.id;
    if (!id) {
      throw new AppError(
        AUCTION_CONSTANTS.MESSAGES.AUCTION_NOT_FOUND,
        AUCTION_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    const result = await this._endAuctionUsecase.execute({
      auctionId: id as string,
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
      message: AUCTION_CONSTANTS.MESSAGES.AUCTION_ENDED_SUCCESSFULLY,
      status: AUCTION_CONSTANTS.CODES.OK,
      error: null,
    });
  });

  getBrowseAuctions = expressAsyncHandler(
    async (req: Request, res: Response) => {
      const validated = browseAuctionSchema.safeParse(req.query);
      if (!validated.success) {
        throw new AppError(
          validated.error.issues[0].message,
          AUCTION_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      const input: IGetBrowseAuctionsInput = {
        category: validated.data.category,
        auctionType:
          (validated.data.auctionType as AuctionType | 'ALL') ?? 'ALL',
      };

      const result = await this._getBrowseAuctionsUsecase.execute(input);

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

  placeBid = expressAsyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(
        AUCTION_CONSTANTS.MESSAGES.USER_NOT_FOUND,
        AUCTION_CONSTANTS.CODES.BAD_REQUEST,
      );
    }
    const id = req.params.id;
    if (!id) {
      throw new AppError(
        AUCTION_CONSTANTS.MESSAGES.AUCTION_NOT_FOUND,
        AUCTION_CONSTANTS.CODES.BAD_REQUEST,
      );
    }
    const parsed = placeBidSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues[0].message,
        AUCTION_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    const input: IPlaceBidInput = {
      auctionId: id as string,
      userId: req.user.id,
      userName: req.user.name,
      amount: parsed.data.amount,
    };

    const result = await this._placeBidUsecase.execute(input);

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
  });
}
