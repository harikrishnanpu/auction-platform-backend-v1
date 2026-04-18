import { IRejectSellerKycOutput } from '@application/dtos/admin/rejectSellerKyc.dto';
import { Result } from '@domain/shared/result';
import { ZodRejectSellerKycInputType } from '@presentation/validators/schemas/admin/rejectSellerKyc.schema';

export interface IRejectSellerKycUsecase {
    execute(
        data: ZodRejectSellerKycInputType,
    ): Promise<Result<IRejectSellerKycOutput>>;
}
