import { User } from '@domain/entities/user/user.entity';
import { Result } from '@domain/shared/result';
export interface IValidatedChangeProfilePasswordInput {
    userId: string;
    otp: string;
    oldPassword: string;
    newPassword: string;
}

export interface IChangeProfilePasswordUsecase {
    execute(data: IValidatedChangeProfilePasswordInput): Promise<Result<User>>;
}
