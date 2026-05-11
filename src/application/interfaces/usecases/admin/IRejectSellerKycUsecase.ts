import { IRejectSellerKycOutput } from '@application/dtos/admin/rejectSellerKyc.dto';
import { Result } from '@domain/shared/result';
export interface IValidatedRejectSellerKycInput {
    id: string;
    reason: string;
}

export interface IRejectSellerKycUsecase {
    execute(
        data: IValidatedRejectSellerKycInput,
    ): Promise<Result<IRejectSellerKycOutput>>;
}
