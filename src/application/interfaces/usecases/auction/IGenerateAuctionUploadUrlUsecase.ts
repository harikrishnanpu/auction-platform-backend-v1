import { IGenerateAuctionUploadUrlOutput } from '@application/dtos/auction/generate-auction-upload-url.dto';
import { Result } from '@domain/shared/result';
export interface IValidatedGenerateAuctionUploadUrlInput {
    userId: string;
    fileName: string;
    contentType: string;
    fileSize: number;
}

export interface IGenerateAuctionUploadUrlUsecase {
    execute(
        data: IValidatedGenerateAuctionUploadUrlInput,
    ): Promise<Result<IGenerateAuctionUploadUrlOutput>>;
}
