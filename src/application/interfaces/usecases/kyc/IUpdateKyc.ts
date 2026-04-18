import { IUpdateKycOutput } from '@application/dtos/kyc/update-kyc.dto';
import { Result } from '@domain/shared/result';
import { ZodUpdateKycInputType } from '@presentation/validators/schemas/kyc/updateKyc.schema';

export interface IUpdateKycUsecase {
    execute(data: ZodUpdateKycInputType): Promise<Result<IUpdateKycOutput>>;
}
