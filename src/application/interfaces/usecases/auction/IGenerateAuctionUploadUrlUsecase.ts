import { IGenerateAuctionUploadUrlOutput } from '@application/dtos/auction/generate-auction-upload-url.dto';
import { Result } from '@domain/shared/result';
import { ZodGenerateAuctionUploadUrlInputType } from '@presentation/validators/schemas/auction/generateAuctionUploadUrl.schema';

export interface IGenerateAuctionUploadUrlUsecase {
    execute(
        data: ZodGenerateAuctionUploadUrlInputType,
    ): Promise<Result<IGenerateAuctionUploadUrlOutput>>;
}
