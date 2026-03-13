import expressAsyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { uploadKycUrlSchema } from '@presentation/validators/schemas/kyc/uploadKyc.schema';
import { AppError } from '@presentation/http/error/app.error';
import { KYC_CONSTANTS } from '@presentation/constants/kyc/kyc.constants';
import { UploadKycGetUrlInput } from '@application/dtos/kyc/upload-kyc.dto';
import { inject, injectable } from 'inversify';
import { TYPES } from '@di/types.di';
import { IGetKycStatusInput } from '@application/dtos/kyc/get-kyc-status.usecase';
import { IGetKycStatusUsecase } from '@application/interfaces/usecases/kyc/IGetKycStatusUsecase';
import { getKycStatusSchema } from '@presentation/validators/schemas/kyc/getKycStatus.schema';
import { IGetKycUploadUrlUsecase } from '@application/interfaces/usecases/kyc/IGetKycUploadUrlUsecase';
import { updateKycSchema } from '@presentation/validators/schemas/kyc/updateKyc.schema';
import { IUpdateKycInput } from '@application/dtos/kyc/update-kyc.dto';
import { IUpdateKycUsecase } from '@application/interfaces/usecases/kyc/IUpdateKyc';

@injectable()
export class KycController {
  constructor(
    @inject(TYPES.IGetKycUploadUrlUsecase)
    private readonly _getKycUploadUrlUsecase: IGetKycUploadUrlUsecase,
    @inject(TYPES.IGetKycStatusUsecase)
    private readonly _getKycStatusUsecase: IGetKycStatusUsecase,
    @inject(TYPES.IUpdateKycUsecase)
    private readonly _updateKycUsecase: IUpdateKycUsecase,
  ) {}

  getKycUploadUrl = expressAsyncHandler(async (req: Request, res: Response) => {
    const validationResult = uploadKycUrlSchema.safeParse(req.body);

    if (!validationResult.success) {
      throw new AppError(
        validationResult.error.issues[0].message,
        KYC_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    const uploadKycUrlInput: UploadKycGetUrlInput = {
      kycFor: validationResult.data.kycFor,
      fileName: validationResult.data.fileName,
      contentType: validationResult.data.contentType,
      fileSize: validationResult.data.fileSize,
    };

    const result =
      await this._getKycUploadUrlUsecase.execute(uploadKycUrlInput);

    if (result.isFailure) {
      throw new AppError(result.getError(), KYC_CONSTANTS.CODES.BAD_REQUEST);
    }

    res.status(KYC_CONSTANTS.CODES.OK).json({
      data: result.getValue(),
      success: true,
      message: KYC_CONSTANTS.MESSAGES.KYC_URL_UPLOADED_SUCCESSFULLY,
      status: KYC_CONSTANTS.CODES.OK,
      error: null,
    });
  });

  getKycStatus = expressAsyncHandler(async (req: Request, res: Response) => {
    console.log('getKycStatus controller called');

    const validationResult = getKycStatusSchema.safeParse(req.body);

    if (!req.user) {
      throw new AppError(
        KYC_CONSTANTS.MESSAGES.USER_NOT_FOUND,
        KYC_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    if (!validationResult.success) {
      throw new AppError(
        validationResult.error.issues[0].message,
        KYC_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    const getKycStatusInput: IGetKycStatusInput = {
      userId: req.user.id,
      kycFor: validationResult.data.kycFor,
    };

    const result = await this._getKycStatusUsecase.execute(getKycStatusInput);

    if (result.isFailure) {
      console.log('error', result.getError());
      throw new AppError(result.getError(), KYC_CONSTANTS.CODES.BAD_REQUEST);
    }

    console.log('KYC STATUS RESPONSE:', result.getValue());

    res.status(KYC_CONSTANTS.CODES.OK).json({
      data: result.getValue(),
      success: true,
      message: KYC_CONSTANTS.MESSAGES.KYC_STATUS_FETCHED_SUCCESSFULLY,
      status: KYC_CONSTANTS.CODES.OK,
      error: null,
    });
  });

  updateKyc = expressAsyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(
        KYC_CONSTANTS.MESSAGES.USER_NOT_FOUND,
        KYC_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    console.log(req.body);

    const validationResult = updateKycSchema.safeParse(req.body);

    if (!validationResult.success) {
      throw new AppError(
        validationResult.error.issues[0].message,
        KYC_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    const updateKycInput: IUpdateKycInput = {
      userId: req.user.id,
      kycFor: validationResult.data.kycFor,
      documentType: validationResult.data.documentType,
      side: validationResult.data.side,
      documentUrl: validationResult.data.fileKey,
    };

    const result = await this._updateKycUsecase.execute(updateKycInput);

    if (result.isFailure) {
      throw new AppError(result.getError(), KYC_CONSTANTS.CODES.BAD_REQUEST);
    }

    res.status(KYC_CONSTANTS.CODES.OK).json({
      data: result.getValue(),
      success: true,
      message: KYC_CONSTANTS.MESSAGES.KYC_UPDATED_SUCCESSFULLY,
      status: KYC_CONSTANTS.CODES.OK,
      error: null,
    });
  });
}
