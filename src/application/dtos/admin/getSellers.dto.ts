import {
  AuthProviderType,
  UserStatus,
} from '@domain/entities/user/user.entity';
import { KycStatus } from '@domain/entities/kyc/kyc.entity';
import { UserRoleType } from '../auth/loginUser.dto';

export interface ISellerResponseDto {
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
  kycStatus: KycStatus;
}

export interface IGetAllSellersInput {
  page: number;
  limit: number;
  pendingOnly?: boolean;
}

export interface IGetAllSellersOutput {
  sellers: ISellerResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
