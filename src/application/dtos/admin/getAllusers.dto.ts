import {
  AuthProviderType,
  UserStatus,
} from '@domain/entities/user/user.entity';
import { UserRoleType } from '../auth/loginUser.dto';
import { userResponseDto } from '../user/userResponse.dto';

export interface IGetAllUsersInput {
  page: number;
  limit: number;
  search: string;
  sort: string;
  order: 'asc' | 'desc';
  role: UserRoleType | 'ALL';
  status: UserStatus | 'ALL';
  authProvider: AuthProviderType | 'ALL';
}

export interface IGetAllUsersOutput {
  users: userResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
