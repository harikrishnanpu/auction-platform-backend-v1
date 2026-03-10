import { ChangePasswordInput } from '@application/dtos/auth/changePassword.dto';
import { Result } from '@domain/shared/result';

export interface IChangePasswordUsecase {
  execute(data: ChangePasswordInput): Promise<Result<null>>;
}
