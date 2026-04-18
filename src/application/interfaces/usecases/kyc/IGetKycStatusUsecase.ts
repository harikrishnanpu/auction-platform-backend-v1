import { IGetKycStatusOutput } from '@application/dtos/kyc/get-kyc-status.usecase';
import { Result } from '@domain/shared/result';
import { ZodGetKycStatusInputType } from '@presentation/validators/schemas/kyc/getKycStatus.schema';

export interface IGetKycStatusUsecase {
    execute(
        data: ZodGetKycStatusInputType,
    ): Promise<Result<IGetKycStatusOutput>>;
}
