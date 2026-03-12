import expressAsyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { uploadKycUrlSchema } from '@presentation/validators/schemas/kyc/uploadKyc.schema';
import { AppError } from '@presentation/http/error/app.error';
import { KYC_CONSTANTS } from '@presentation/constants/kyc/kyc.constants';
import { UploadKycGetUrlInput } from '@application/dtos/kyc/upload-kyc.dto';
import { inject, injectable } from 'inversify';
import { TYPES } from '@di/types.di';
import { IUploadKycGetUrlUsecase } from '@application/interfaces/usecases/kyc/IUploadKycGetUrlUsecase';
import { IGetKycStatusInput } from '@application/dtos/kyc/get-kyc-status.usecase';
import { IGetKycStatusUsecase } from '@application/interfaces/usecases/kyc/IGetKycStatusUsecase';
import { getKycStatusSchema } from '@presentation/validators/schemas/kyc/getKycStatus.schema';

@injectable()
export class KycController {
  constructor(
    @inject(TYPES.IUploadKycGetUrlUsecase)
    private readonly _uploadKycUrlUsecase: IUploadKycGetUrlUsecase,
    @inject(TYPES.IGetKycStatusUsecase)
    private readonly _getKycStatusUsecase: IGetKycStatusUsecase,
  ) {}

  uploadKycUrl = expressAsyncHandler(async (req: Request, res: Response) => {
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

    const result = await this._uploadKycUrlUsecase.execute(uploadKycUrlInput);

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
      throw new AppError(result.getError(), KYC_CONSTANTS.CODES.BAD_REQUEST);
    }

    res.status(KYC_CONSTANTS.CODES.OK).json({
      data: result.getValue(),
      success: true,
      message: KYC_CONSTANTS.MESSAGES.KYC_STATUS_FETCHED_SUCCESSFULLY,
      status: KYC_CONSTANTS.CODES.OK,
      error: null,
    });
  });
}
