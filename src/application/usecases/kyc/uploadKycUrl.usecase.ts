import {
  UploadKycGetUrlInput,
  UploadKycGetUrlOutput,
} from '@application/dtos/kyc/upload-kyc.dto';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { IStorageService } from '@application/interfaces/services/IStorageService';
import { IUploadKycGetUrlUsecase } from '@application/interfaces/usecases/kyc/IUploadKycGetUrlUsecase';
import { TYPES } from '@di/types.di';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class UploadKycUrlUseCase implements IUploadKycGetUrlUsecase {
  constructor(
    @inject(TYPES.IStorageService)
    private readonly _storageService: IStorageService,
    @inject(TYPES.IIdGeneratingService)
    private readonly _idGeneratingService: IIdGeneratingService,
  ) {}

  async execute(
    dto: UploadKycGetUrlInput,
  ): Promise<Result<UploadKycGetUrlOutput>> {
    try {
      const { contentType, fileSize, fileName, kycFor } = dto;

      const filName = `kyc/${kycFor}/${this._idGeneratingService.generateId()}-${fileName}`;

      const generateUploadUrlInput = {
        fileName: filName,
        contentType: contentType,
        fileSize: fileSize,
      };

      const url = await this._storageService.generateUploadUrl(
        generateUploadUrlInput,
      );

      if (url.isFailure) {
        return Result.fail(url.getError());
      }

      const uploadKycGetUrlOutput: UploadKycGetUrlOutput = {
        uploadUrl: url.getValue(),
        fileKey: filName,
      };

      return Result.ok(uploadKycGetUrlOutput);
    } catch (error) {
      console.log(error);
      return Result.fail('UNEXPECTED ERROR FROM UPLOAD KYC URL USECASE');
    }
  }
}
