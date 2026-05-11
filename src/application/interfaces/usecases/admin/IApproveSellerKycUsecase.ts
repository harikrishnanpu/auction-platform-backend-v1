import { IApproveSellerKycOutput } from '@application/dtos/admin/approveSellerKyc.dto';
import { Result } from '@domain/shared/result';
export interface IValidatedApproveSellerKycInput {
    id: string;
}

export interface IApproveSellerKycUsecase {
    execute(
        data: IValidatedApproveSellerKycInput,
    ): Promise<Result<IApproveSellerKycOutput>>;
}
