import { User } from '@domain/entities/user/user.entity';
import { Result } from '@domain/shared/result';
import { ZodChangeProfilePasswordInputType } from '@presentation/validators/schemas/user/change-profile-password.schema';

export interface IChangeProfilePasswordUsecase {
    execute(data: ZodChangeProfilePasswordInputType): Promise<Result<User>>;
}
