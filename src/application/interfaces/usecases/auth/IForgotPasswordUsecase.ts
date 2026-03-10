import { Result } from '@domain/shared/result';

export interface IForgotPasswordUsecase {
  execute(email: string): Promise<Result<void>>;
}
