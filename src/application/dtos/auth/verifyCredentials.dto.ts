import { User } from '@domain/entities/user/user.entity';

export interface verifyCredentialsOutput {
  user: User;
  accessToken: string;
  refreshToken: string;
}
