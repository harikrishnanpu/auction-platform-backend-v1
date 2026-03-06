import {
  AuthProviderType,
  UserStatus,
} from '@domain/entities/user/user.entity';
import { UserRoleType } from '../auth/loginUser.dto';

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
}
