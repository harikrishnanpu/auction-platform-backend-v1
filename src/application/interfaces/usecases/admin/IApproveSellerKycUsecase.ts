import {
  IApproveSellerKycInput,
  IApproveSellerKycOutput,
} from '@application/dtos/admin/approveSellerKyc.dto';
import { Result } from '@domain/shared/result';

export interface IApproveSellerKycUsecase {
  execute(
    data: IApproveSellerKycInput,
  ): Promise<Result<IApproveSellerKycOutput>>;
}
