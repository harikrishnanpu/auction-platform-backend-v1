import {
  IUpdateKycInput,
  IUpdateKycOutput,
} from '@application/dtos/kyc/update-kyc.dto';
import { Result } from '@domain/shared/result';

export interface IUpdateKycUsecase {
  execute(data: IUpdateKycInput): Promise<Result<IUpdateKycOutput>>;
}
