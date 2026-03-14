import {
  IGenerateAuctionUploadUrlInput,
  IGenerateAuctionUploadUrlOutput,
} from '@application/dtos/auction/generate-auction-upload-url.dto';
import { Result } from '@domain/shared/result';

export interface IGenerateAuctionUploadUrlUsecase {
  execute(
    input: IGenerateAuctionUploadUrlInput,
  ): Promise<Result<IGenerateAuctionUploadUrlOutput>>;
}
