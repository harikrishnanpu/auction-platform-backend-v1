import { UserSuspension } from '@domain/entities/fraud/user-suspension.entity';
import { Result } from '@domain/shared/result';

export interface IFindSuspendedUsersFilters {
    page: number;
    limit: number;
    search: string;
}

export interface IFindSuspendedUsersOutputItem {
    userId: string;
    userName: string;
    email: string;
    status: string;
    activeSuspensionType: string;
    activeSuspensionEndsAt: Date | null;
}

export interface IFindSuspendedUsersOutput {
    users: IFindSuspendedUsersOutputItem[];
    total: number;
}

export interface IUserSuspensionRepository {
    create(userSuspension: UserSuspension): Promise<Result<UserSuspension>>;

    findSuspensionTimeline(userId: string): Promise<Result<UserSuspension[]>>;
    findSuspendedUsers(
        filters: IFindSuspendedUsersFilters,
    ): Promise<Result<IFindSuspendedUsersOutput>>;
    incrementUserFraudLevel(
        userId: string,
        points: number,
    ): Promise<Result<number>>;
    markUserSuspended(userId: string): Promise<Result<void>>;
}
