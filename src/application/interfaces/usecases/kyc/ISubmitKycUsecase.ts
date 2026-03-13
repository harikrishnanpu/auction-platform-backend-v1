import {
  ISubmitKycInput,
  ISubmitKycOutput,
} from '@application/dtos/kyc/submit-kyc.dto';
import { Result } from '@domain/shared/result';

export interface ISubmitKycUsecase {
  execute(data: ISubmitKycInput): Promise<Result<ISubmitKycOutput>>;
}
