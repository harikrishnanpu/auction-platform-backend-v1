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

@injectable()
export class SellerController {
  constructor(
    @inject(TYPES.IGetAllSellerAuctionCategoryRequestUsecase)
    private readonly _getAllSellerAuctionCategoryRequestUsecase: IGetAllSellerAuctionCategoryRequestUsecase,
    @inject(TYPES.IRequestAuctionCategoryUsecase)
    private readonly _requestAuctionCategoryUsecase: IRequestAuctionCategoryUsecase,
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
}
