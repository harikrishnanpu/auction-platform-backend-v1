import {
  AuthProviderType,
  UserStatus,
} from '@domain/entities/user/user.entity';

export interface LoginUserInput {
  email: string;
  password: string;
}

export enum UserRoleType {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SELLER = 'SELLER',
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
}

export interface LoginUserOutput {
  user: userResponseDto;
  accessToken: string;
  refreshToken: string;
}
