import { UserRoleType } from '@application/dtos/auth/userRole.dto';
import {
    AuthProviderType,
    UserStatus,
} from '@domain/entities/user/user.entity';
import { UserSubscriptionStatus } from '@domain/entities/subscription/user-subscription.entity';

export interface UserSubscriptionSummaryDto {
    planId: string;
    planName: string;
    status: UserSubscriptionStatus;
    endDate: string;
}

export interface userResponseDto {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    avatar_url: string;
    isProfileCompleted: boolean;
    isVerified: boolean;
    status: UserStatus;
    authProvider: AuthProviderType;
    roles: UserRoleType[];
    subscription?: UserSubscriptionSummaryDto | null;
}
