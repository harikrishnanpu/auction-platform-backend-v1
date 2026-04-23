import { UserSuspension } from '@domain/entities/fraud/user-suspension.entity';
import { Result } from '@domain/shared/result';

export interface IUserSuspensionRepository {
    create(userSuspension: UserSuspension): Promise<Result<UserSuspension>>;
    findUserSuspensions(userId: string): Promise<Result<UserSuspension[]>>;
}
