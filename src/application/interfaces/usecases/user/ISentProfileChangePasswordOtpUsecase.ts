import { Result } from '@domain/shared/result';

export interface ISendProfileChangePasswordOtpUsecase {
  execute(userId: string): Promise<Result<void>>;
}
