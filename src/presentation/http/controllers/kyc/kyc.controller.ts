import expressAsyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import {
  uploadKycUrlSchema,
  ZodUploadKycUrlInputType,
} from '@presentation/validators/schemas/kyc/uploadKyc.schema';
import { AppError } from '@presentation/http/error/app.error';
import { KYC_CONSTANTS } from '@presentation/constants/kyc/kyc.constants';
import { UploadKycGetUrlOutput } from '@application/dtos/kyc/upload-kyc.dto';
import { inject, injectable } from 'inversify';
import { TYPES } from '@di/types.di';
import { IGetKycStatusOutput } from '@application/dtos/kyc/get-kyc-status.usecase';
import { IGetKycStatusUsecase } from '@application/interfaces/usecases/kyc/IGetKycStatusUsecase';
import {
  getKycStatusSchema,
  ZodGetKycStatusInputType,
} from '@presentation/validators/schemas/kyc/getKycStatus.schema';
import { IGetKycUploadUrlUsecase } from '@application/interfaces/usecases/kyc/IGetKycUploadUrlUsecase';
import {
  updateKycSchema,
  ZodUpdateKycInputType,
} from '@presentation/validators/schemas/kyc/updateKyc.schema';
import { IUpdateKycOutput } from '@application/dtos/kyc/update-kyc.dto';
import { IUpdateKycUsecase } from '@application/interfaces/usecases/kyc/IUpdateKyc';
import {
  submitKycSchema,
  ZodSubmitKycInputType,
} from '@presentation/validators/schemas/kyc/submitKyc.schema';
import { ISubmitKycUsecase } from '@application/interfaces/usecases/kyc/ISubmitKycUsecase';
import { ISubmitKycOutput } from '@application/dtos/kyc/submit-kyc.dto';
import { ValidationHelper } from '@presentation/http/helpers/validation.helper';
import { KycMapperProfile } from '@application/mappers/kyc/kyc.mapper';
import { ResponseHelper } from '@presentation/http/helpers/response.helper';

@injectable()
export class KycController {
  constructor(
    @inject(TYPES.IGetKycUploadUrlUsecase)
    private readonly _getKycUploadUrlUsecase: IGetKycUploadUrlUsecase,
    @inject(TYPES.IGetKycStatusUsecase)
    private readonly _getKycStatusUsecase: IGetKycStatusUsecase,
    @inject(TYPES.IUpdateKycUsecase)
    private readonly _updateKycUsecase: IUpdateKycUsecase,
    @inject(TYPES.ISubmitKycUsecase)
    private readonly _submitKycUsecase: ISubmitKycUsecase,
  ) {}

  getKycUploadUrl = expressAsyncHandler(async (req: Request, res: Response) => {
    const validationResult =
      ValidationHelper.validate<ZodUploadKycUrlInputType>(
        uploadKycUrlSchema,
        req.body,
      );

    const dto = KycMapperProfile.toUploadKycUrlInput(validationResult);

    const result = await this._getKycUploadUrlUsecase.execute(dto);

    if (result.isFailure) {
      throw new AppError(result.getError(), KYC_CONSTANTS.CODES.BAD_REQUEST);
    }

    ResponseHelper.success<UploadKycGetUrlOutput>(
      res,
      result.getValue(),
      KYC_CONSTANTS.MESSAGES.KYC_URL_UPLOADED_SUCCESSFULLY,
      KYC_CONSTANTS.CODES.OK,
    );
  });

  getKycStatus = expressAsyncHandler(async (req: Request, res: Response) => {
    console.log('getKycStatus controller called');

    const validationResult =
      ValidationHelper.validate<ZodGetKycStatusInputType>(
        getKycStatusSchema,
        req.body,
      );

    if (!req.user) {
      throw new AppError(
        KYC_CONSTANTS.MESSAGES.USER_NOT_FOUND,
        KYC_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    const dto = KycMapperProfile.toGetKycStatusInput(
      validationResult,
      req.user.id,
    );

    const result = await this._getKycStatusUsecase.execute(dto);

    if (result.isFailure) {
      console.log('error', result.getError());
      throw new AppError(result.getError(), KYC_CONSTANTS.CODES.BAD_REQUEST);
    }

    // console.log('KYC STATUS RESPONSE:', result.getValue());

    ResponseHelper.success<IGetKycStatusOutput>(
      res,
      result.getValue(),
      KYC_CONSTANTS.MESSAGES.KYC_STATUS_FETCHED_SUCCESSFULLY,
      KYC_CONSTANTS.CODES.OK,
    );
  });

  updateKyc = expressAsyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(
        KYC_CONSTANTS.MESSAGES.USER_NOT_FOUND,
        KYC_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    console.log(req.body);

    const validationResult = ValidationHelper.validate<ZodUpdateKycInputType>(
      updateKycSchema,
      req.body,
    );

    const dto = KycMapperProfile.toUpdateKycInput(
      validationResult,
      req.user.id,
    );

    const result = await this._updateKycUsecase.execute(dto);

    if (result.isFailure) {
      throw new AppError(result.getError(), KYC_CONSTANTS.CODES.BAD_REQUEST);
    }

    ResponseHelper.success<IUpdateKycOutput>(
      res,
      result.getValue(),
      KYC_CONSTANTS.MESSAGES.KYC_UPDATED_SUCCESSFULLY,
      KYC_CONSTANTS.CODES.OK,
    );
  });

  submitKyc = expressAsyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(
        KYC_CONSTANTS.MESSAGES.USER_NOT_FOUND,
        KYC_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    const validationResult = ValidationHelper.validate<ZodSubmitKycInputType>(
      submitKycSchema,
      req.body,
    );

    const dto = KycMapperProfile.toSubmitKycInput(
      validationResult,
      req.user.id,
    );

    const result = await this._submitKycUsecase.execute(dto);

    if (result.isFailure) {
      throw new AppError(result.getError(), KYC_CONSTANTS.CODES.BAD_REQUEST);
    }

    ResponseHelper.success<ISubmitKycOutput>(
      res,
      result.getValue(),
      KYC_CONSTANTS.MESSAGES.KYC_SUBMITTED_SUCCESSFULLY,
      KYC_CONSTANTS.CODES.OK,
    );
  });
}
