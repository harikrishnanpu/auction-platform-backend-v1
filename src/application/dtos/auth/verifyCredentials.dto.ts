import { AuthProviderType } from '@domain/entities/user/user.entity';
import { UserRoleType } from './loginUser.dto';
import { OtpChannel, OtpPurpose } from '@domain/entities/otp/otp.entity';

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

export interface VerifyCredentialsInput {
  otp: string;
  email: string;
  purpose: OtpPurpose;
  channel: OtpChannel;
}
