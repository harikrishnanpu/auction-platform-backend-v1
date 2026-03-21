import { AuctionType } from '@domain/entities/auction/auction.entity';
import { ICreateAuctionUsecase } from '@application/interfaces/usecases/auction/ICreateAuctionUsecase';
import { IGenerateAuctionUploadUrlUsecase } from '@application/interfaces/usecases/auction/IGenerateAuctionUploadUrlUsecase';
import { IUpdateAuctionUsecase } from '@application/interfaces/usecases/auction/IUpdateAuctionUsecase';
import { IPublishAuctionUsecase } from '@application/interfaces/usecases/auction/IPublishAuctionUsecase';
import { IEndAuctionUsecase } from '@application/interfaces/usecases/auction/IEndAuctionUsecase';
import { IPlaceBidUsecase } from '@application/interfaces/usecases/auction/IPlaceBidUsecase';
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
import { placeBidSchema } from '@presentation/validators/schemas/auction/placeBid.schema';
import { publishAuctionParamsSchema } from '@presentation/validators/schemas/auction/publishAuctionParams.schema';
import { IPlaceBidInput } from '@application/dtos/auction/place-bid.dto';
import { AuctionMapperProrfile } from '@application/mappers/auction/auction.mapperProfile';
import { IGetAllAuctionCategoriesUsecase } from '@application/interfaces/usecases/auction/IGetAllAuctionCategoriesUsecase';
import { IGetAuctionByIdUsecase } from '@application/interfaces/usecases/auction/IGetAuctionByIdUsecase';
import { IGetBrowseAuctionsUsecase } from '@application/interfaces/usecases/auction/IGetBrowseAuctionsUsecase';
import { IPauseAuctionUsecase } from '@application/interfaces/usecases/auction/IPauseAuctionUsecase';
import { IResumeAuctionUsecase } from '@application/interfaces/usecases/auction/IResumeAuctionUsecase';
import { getLatestAuctionsSchema } from '@presentation/validators/schemas/auction/getLatestAuctions.schema';
import { getBrowseAuctionsSchema } from '@presentation/validators/schemas/auction/getBrowseAuctions.schema';
import { UserRoleType } from '@application/dtos/auth/loginUser.dto';

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
    @inject(TYPES.IEndAuctionUsecase)
    private readonly _endAuctionUsecase: IEndAuctionUsecase,
    @inject(TYPES.IPlaceBidUsecase)
    private readonly _placeBidUsecase: IPlaceBidUsecase,
    @inject(TYPES.IGetAllAuctionCategoriesUsecase)
    private readonly _getAllAuctionCategoryUsecase: IGetAllAuctionCategoriesUsecase,
    @inject(TYPES.IGetAuctionByIdUsecase)
    private readonly _getAuctionByIdUsecase: IGetAuctionByIdUsecase,
    @inject(TYPES.IPauseAuctionUsecase)
    private readonly _pauseAuctionUsecase: IPauseAuctionUsecase,
    @inject(TYPES.IResumeAuctionUsecase)
    private readonly _resumeAuctionUsecase: IResumeAuctionUsecase,
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

    const parsed = createAuctionSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues[0].message,
        AUCTION_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    const inputDto = AuctionMapperProrfile.toCreateAuctionDto(
      parsed.data,
      req.user.id,
    );

    const result = await this._createAuctionUsecase.execute(inputDto);

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

      console.log(result.getValue());

      res.status(AUCTION_CONSTANTS.CODES.OK).json({
        data: result.getValue(),
        success: true,
        message:
          AUCTION_CONSTANTS.MESSAGES.AUCTION_CATEGORIES_FETCHED_SUCCESSFULLY,
        status: AUCTION_CONSTANTS.CODES.OK,
        error: null,
      });
    },
  );

  getLatestAuctions = expressAsyncHandler(
    async (req: Request, res: Response) => {
      if (!req.user) {
        throw new AppError(
          AUCTION_CONSTANTS.MESSAGES.USER_NOT_FOUND,
          AUCTION_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      const parsed = getLatestAuctionsSchema.safeParse(req.query);
      if (!parsed.success) {
        throw new AppError(
          parsed.error.issues[0]?.message ?? 'Invalid limit',
          AUCTION_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      const result = await this._getBrowseAuctionsUsecase.execute({
        auctionType: 'ALL',
        categoryId: 'ALL',
        page: 1,
        limit: parsed.data.limit,
        sort: 'startAt',
        order: 'desc',
        search: '',
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
        message: AUCTION_CONSTANTS.MESSAGES.AUCTION_FETCHED_SUCCESSFULLY,
        status: AUCTION_CONSTANTS.CODES.OK,
        error: null,
      });
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

      const parsed = getBrowseAuctionsSchema.safeParse(req.query);
      if (!parsed.success) {
        throw new AppError(
          parsed.error.issues[0]?.message ?? 'Invalid query',
          AUCTION_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      const result = await this._getBrowseAuctionsUsecase.execute({
        auctionType:
          parsed.data.auctionType === 'ALL'
            ? 'ALL'
            : (parsed.data.auctionType as AuctionType),
        categoryId: parsed.data.categoryId,
        page: parsed.data.page,
        limit: parsed.data.limit,
        sort: parsed.data.sort,
        order: parsed.data.order,
        search: parsed.data.search,
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
        message: AUCTION_CONSTANTS.MESSAGES.AUCTION_FETCHED_SUCCESSFULLY,
        status: AUCTION_CONSTANTS.CODES.OK,
        error: null,
      });
    },
  );

  getAuctionById = expressAsyncHandler(async (req: Request, res: Response) => {
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

    res.status(AUCTION_CONSTANTS.CODES.OK).json({
      data: result.getValue(),
      success: true,
      message: AUCTION_CONSTANTS.MESSAGES.AUCTION_FETCHED_SUCCESSFULLY,
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
      assets: parsed.data.assets,
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
      isAdmin: req.user.roles?.includes(UserRoleType.ADMIN) ?? false,
    });

    if (result.isFailure) {
      throw new AppError(
        result.getError(),
        AUCTION_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    const updated = result.getValue();
    const io = req.app.get('io');
    if (io) {
      io.to(`auction:${updated.id}`).emit('auction:updated', {
        auctionId: updated.id,
        status: updated.status,
      });
    }

    res.status(AUCTION_CONSTANTS.CODES.OK).json({
      data: updated,
      success: true,
      message: AUCTION_CONSTANTS.MESSAGES.AUCTION_ENDED_SUCCESSFULLY,
      status: AUCTION_CONSTANTS.CODES.OK,
      error: null,
    });
  });

  pauseAuction = expressAsyncHandler(async (req: Request, res: Response) => {
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

    const isAdmin = req.user.roles?.includes(UserRoleType.ADMIN) ?? false;

    const result = await this._pauseAuctionUsecase.execute({
      auctionId: params.data.id,
      userId: req.user.id,
      isAdmin,
    });

    if (result.isFailure) {
      throw new AppError(
        result.getError(),
        AUCTION_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    const updated = result.getValue();
    const io = req.app.get('io');
    if (io) {
      io.to(`auction:${updated.id}`).emit('auction:updated', {
        auctionId: updated.id,
        status: updated.status,
      });
    }

    res.status(AUCTION_CONSTANTS.CODES.OK).json({
      data: updated,
      success: true,
      message: 'Auction paused successfully',
      status: AUCTION_CONSTANTS.CODES.OK,
      error: null,
    });
  });

  resumeAuction = expressAsyncHandler(async (req: Request, res: Response) => {
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

    const isAdmin = req.user.roles?.includes(UserRoleType.ADMIN) ?? false;

    const result = await this._resumeAuctionUsecase.execute({
      auctionId: params.data.id,
      userId: req.user.id,
      isAdmin,
    });

    if (result.isFailure) {
      throw new AppError(
        result.getError(),
        AUCTION_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    const updated = result.getValue();
    const io = req.app.get('io');
    if (io) {
      io.to(`auction:${updated.id}`).emit('auction:updated', {
        auctionId: updated.id,
        status: updated.status,
      });
    }

    res.status(AUCTION_CONSTANTS.CODES.OK).json({
      data: updated,
      success: true,
      message: 'Auction resumed successfully',
      status: AUCTION_CONSTANTS.CODES.OK,
      error: null,
    });
  });

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
