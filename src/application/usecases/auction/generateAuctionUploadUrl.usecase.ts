import { IGenerateAuctionUploadUrlOutput } from '@application/dtos/auction/generate-auction-upload-url.dto';
import { IGenerateAuctionUploadUrlUsecase } from '@application/interfaces/usecases/auction/IGenerateAuctionUploadUrlUsecase';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { IStorageService } from '@application/interfaces/services/IStorageService';
import { TYPES } from '@di/types.di';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';
import { ZodGenerateAuctionUploadUrlInputType } from '@presentation/validators/schemas/auction/generateAuctionUploadUrl.schema';
import { AuctionMapperProrfile } from '@application/mappers/auction/auction.mapperProfile';

@injectable()
export class GenerateAuctionUploadUrlUsecase implements IGenerateAuctionUploadUrlUsecase {
    constructor(
        @inject(TYPES.IStorageService)
        private readonly _storageService: IStorageService,
        @inject(TYPES.IIdGeneratingService)
        private readonly _idGeneratingService: IIdGeneratingService,
    ) {}

    async execute(
        input: ZodGenerateAuctionUploadUrlInputType,
    ): Promise<Result<IGenerateAuctionUploadUrlOutput>> {
        const dto = AuctionMapperProrfile.toGenerateAuctionUploadUrlDto(input);

        const { userId, fileName, contentType, fileSize } = dto;

        const key = `auctions/${userId}/${this._idGeneratingService.generateId()}-${fileName}`;

        const result = await this._storageService.generateUploadUrl({
            fileName: key,
            contentType: contentType,
            fileSize: fileSize,
        });

        if (result.isFailure) return Result.fail(result.getError());

        return Result.ok({
            uploadUrl: result.getValue(),
            fileKey: key,
        });
    }
}
