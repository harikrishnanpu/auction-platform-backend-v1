import { KycFor } from '@domain/entities/kyc/kyc.entity';

export interface UploadKycGetUrlInput {
  contentType: string;
  fileSize: number;
  fileName: string;
  kycFor: KycFor;
}

export interface UploadKycGetUrlOutput {
  uploadUrl: string;
  fileKey: string;
}
