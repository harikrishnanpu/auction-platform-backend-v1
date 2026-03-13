import { KycFor, KycStatus } from '@domain/entities/kyc/kyc.entity';

export interface ISubmitKycInput {
  userId: string;
  kycFor: KycFor;
}

export interface ISubmitKycOutput {
  status: KycStatus;
}
