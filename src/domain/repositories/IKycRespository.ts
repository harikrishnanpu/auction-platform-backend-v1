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
    save(kyc: Kyc): Promise<Result<Kyc>>;

    findByUserIdAndFor(
        userId: string,
        kycFor: KycFor,
    ): Promise<Result<Kyc | null>>;

    findAllByKycFor(
        kycFor: KycFor,
        options?: IFindAllByKycForOptions,
    ): Promise<Result<IFindAllByKycForResult>>;

    countByKycFor(kycFor: KycFor, status?: KycStatus): Promise<Result<number>>;
}
