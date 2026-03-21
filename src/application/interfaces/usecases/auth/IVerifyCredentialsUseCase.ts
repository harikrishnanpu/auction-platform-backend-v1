import {
  VerifyCredentialsInput,
  verifyCredentialsOutput,
} from '@application/dtos/auth/verifyCredentials.dto';
import { Result } from '@domain/shared/result';

export interface IVerifyCredentialsUseCase {
  execute(
    data: VerifyCredentialsInput,
  ): Promise<Result<verifyCredentialsOutput>>;
}
