import {
  IRejectSellerKycInput,
  IRejectSellerKycOutput,
} from '@application/dtos/admin/rejectSellerKyc.dto';
import { Result } from '@domain/shared/result';

export interface IRejectSellerKycUsecase {
  execute(data: IRejectSellerKycInput): Promise<Result<IRejectSellerKycOutput>>;
}
