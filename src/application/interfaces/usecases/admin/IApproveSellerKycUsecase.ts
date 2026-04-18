import { IApproveSellerKycOutput } from '@application/dtos/admin/approveSellerKyc.dto';
import { Result } from '@domain/shared/result';
import { ZodGetAdminSellerInputType } from '@presentation/validators/schemas/admin/getAdminSeller.schema';

export interface IApproveSellerKycUsecase {
    execute(
        data: ZodGetAdminSellerInputType,
    ): Promise<Result<IApproveSellerKycOutput>>;
}
