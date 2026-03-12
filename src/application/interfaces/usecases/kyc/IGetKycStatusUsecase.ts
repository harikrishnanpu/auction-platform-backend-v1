import {
  IGetKycStatusInput,
  IGetKycStatusOutput,
} from '@application/dtos/kyc/get-kyc-status.usecase';
import { Result } from '@domain/shared/result';

export interface IGetKycStatusUsecase {
  execute(input: IGetKycStatusInput): Promise<Result<IGetKycStatusOutput>>;
}
