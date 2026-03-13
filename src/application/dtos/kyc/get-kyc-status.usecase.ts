import { KycFor, KycStatus } from '@domain/entities/kyc/kyc.entity';
import { IKycResponseDto } from './kyc.response.dto';

export interface IGetKycStatusInput {
  userId: string;
  kycFor: KycFor;
}

export interface IGetKycStatusOutput {
  kyc: IKycResponseDto | null;
  status: KycStatus;
}
