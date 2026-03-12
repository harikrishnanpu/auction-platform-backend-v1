import { KycFor, KycStatus } from '@domain/entities/kyc/kyc.entity';

export interface IGetKycStatusInput {
  userId: string;
  kycFor: KycFor;
}

export interface IGetKycStatusOutput {
  status: KycStatus;
}
