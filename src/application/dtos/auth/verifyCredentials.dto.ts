import { AuthProviderType } from '@domain/entities/user/user.entity';
import { UserRoleType } from '@prisma/client';

export interface userResponseDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar_url: string;
  authProvider: AuthProviderType;
  roles: UserRoleType[];
}

export interface verifyCredentialsOutput {
  user: userResponseDto;
  accessToken: string;
  refreshToken: string;
}
