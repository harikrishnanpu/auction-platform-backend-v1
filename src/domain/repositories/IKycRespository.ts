import { Kyc, KycFor } from '@domain/entities/kyc/kyc.entity';
import { Result } from '@domain/shared/result';

export interface IKycRepository {
  findByUserIdAndFor(userId: string, kycFor: KycFor): Promise<Result<Kyc>>;
  save(kyc: Kyc): Promise<void>;
}
