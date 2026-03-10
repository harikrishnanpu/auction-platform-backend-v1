import { ChangeProfilePasswordInput } from '@application/dtos/user/userProfile.dto';
import { User } from '@domain/entities/user/user.entity';
import { Result } from '@domain/shared/result';

export interface IChangeProfilePasswordUsecase {
  execute(data: ChangeProfilePasswordInput): Promise<Result<User>>;
}
