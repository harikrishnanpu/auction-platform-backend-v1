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
  role: UserRoleType | 'ALL';
  status: UserStatus | 'ALL';
  authProvider: AuthProviderType | 'ALL';
}
