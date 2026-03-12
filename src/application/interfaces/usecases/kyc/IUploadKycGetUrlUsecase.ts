import {
  UploadKycGetUrlInput,
  UploadKycGetUrlOutput,
} from '@application/dtos/kyc/upload-kyc.dto';
import { Result } from '@domain/shared/result';

export interface IUploadKycGetUrlUsecase {
  execute(dto: UploadKycGetUrlInput): Promise<Result<UploadKycGetUrlOutput>>;
}
