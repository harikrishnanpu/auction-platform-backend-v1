import { Kyc, KycFor, KycStatus } from '@domain/entities/kyc/kyc.entity';
import { Result } from '@domain/shared/result';

export interface IFindAllByKycForOptions {
  excludeStatus?: KycStatus;
  skip?: number;
  take?: number;
}

export interface IFindAllByKycForResult {
  kycs: Kyc[];
  total: number;
}

export interface IKycRepository {
  findByUserIdAndFor(userId: string, kycFor: KycFor): Promise<Result<Kyc>>;
  findAllByKycFor(
    kycFor: KycFor,
    options?: IFindAllByKycForOptions,
  ): Promise<Result<IFindAllByKycForResult>>;
  save(kyc: Kyc): Promise<void>;
}
