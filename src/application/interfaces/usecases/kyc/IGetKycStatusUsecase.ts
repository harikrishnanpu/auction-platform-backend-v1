import { IGetKycStatusOutput } from '@application/dtos/kyc/get-kyc-status.usecase';
import { KycFor } from '@domain/entities/kyc/kyc.entity';
import { Result } from '@domain/shared/result';

export interface IValidatedGetKycStatusInput {
    userId: string;
    kycFor: KycFor;
}

export interface IGetKycStatusUsecase {
    execute(
        data: IValidatedGetKycStatusInput,
    ): Promise<Result<IGetKycStatusOutput>>;
}
