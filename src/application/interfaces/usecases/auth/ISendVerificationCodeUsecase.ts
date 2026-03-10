import { Result } from '@domain/shared/result';

export interface ISendVerificationCodeUsecase {
  execute(email: string): Promise<Result<void>>;
}
