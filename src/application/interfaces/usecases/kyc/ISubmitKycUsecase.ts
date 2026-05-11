import { ISubmitKycOutput } from '@application/dtos/kyc/submit-kyc.dto';
import { KycFor } from '@domain/entities/kyc/kyc.entity';
import { Result } from '@domain/shared/result';

export interface IValidatedSubmitKycInput {
    kycFor: KycFor;
    userId: string;
}

export interface ISubmitKycUsecase {
    execute(data: IValidatedSubmitKycInput): Promise<Result<ISubmitKycOutput>>;
}
