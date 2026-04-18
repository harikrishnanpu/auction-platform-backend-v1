import { ISubmitKycOutput } from '@application/dtos/kyc/submit-kyc.dto';
import { Result } from '@domain/shared/result';
import { ZodSubmitKycInputType } from '@presentation/validators/schemas/kyc/submitKyc.schema';

export interface ISubmitKycUsecase {
    execute(data: ZodSubmitKycInputType): Promise<Result<ISubmitKycOutput>>;
}
