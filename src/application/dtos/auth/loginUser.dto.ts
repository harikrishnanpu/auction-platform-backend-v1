import { User } from '@domain/entities/user/user.entity';

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface LoginUserOutput {
  user: User;
  accessToken: string;
  refreshToken: string;
}
