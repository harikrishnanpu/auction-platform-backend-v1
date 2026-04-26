import { UserRoleType } from '@application/dtos/auth/loginUser.dto';
import {
    AuthProviderType,
    UserStatus,
} from '@domain/entities/user/user.entity';

export interface IFindAllUsersInput {
    page: number;
    limit: number;
    search: string;
    sort: string;
    order: 'asc' | 'desc';
    role?: UserRoleType;
    status?: UserStatus;
    authProvider?: AuthProviderType;
}

export interface IFindSuspendedUsersInput {
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
