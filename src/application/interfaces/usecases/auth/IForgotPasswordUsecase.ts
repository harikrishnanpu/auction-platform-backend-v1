import { ForgotPasswordInput } from '@application/dtos/auth/forgotPassword.dto';
import { Result } from '@domain/shared/result';

export interface IForgotPasswordUsecase {
  execute(data: ForgotPasswordInput): Promise<Result<void>>;
}
