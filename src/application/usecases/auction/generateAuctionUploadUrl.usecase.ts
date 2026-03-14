import {
  IGenerateAuctionUploadUrlInput,
  IGenerateAuctionUploadUrlOutput,
} from '@application/dtos/auction/generate-auction-upload-url.dto';
import { IGenerateAuctionUploadUrlUsecase } from '@application/interfaces/usecases/auction/IGenerateAuctionUploadUrlUsecase';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { IStorageService } from '@application/interfaces/services/IStorageService';
import { TYPES } from '@di/types.di';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class GenerateAuctionUploadUrlUsecase implements IGenerateAuctionUploadUrlUsecase {
  constructor(
    @inject(TYPES.IStorageService)
    private readonly _storageService: IStorageService,
    @inject(TYPES.IIdGeneratingService)
    private readonly _idGeneratingService: IIdGeneratingService,
  ) {}

  async execute(
    input: IGenerateAuctionUploadUrlInput,
  ): Promise<Result<IGenerateAuctionUploadUrlOutput>> {
    const key = `auctions/${input.userId}/${this._idGeneratingService.generateId()}-${input.fileName}`;

    const result = await this._storageService.generateUploadUrl({
      fileName: key,
      contentType: input.contentType,
      fileSize: input.fileSize,
    });

    if (result.isFailure) return Result.fail(result.getError());

    return Result.ok({
      uploadUrl: result.getValue(),
      fileKey: key,
    });
  }
}
