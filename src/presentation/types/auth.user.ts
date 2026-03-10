import { UserRoleType } from '@application/dtos/auth/loginUser.dto';
import { AuthProviderType } from '@domain/entities/user/user.entity';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar_url: string;
  isProfileCompleted: boolean;
  isVerified: boolean;
  status: string;
  authProvider: AuthProviderType;
  roles: UserRoleType[];
}
