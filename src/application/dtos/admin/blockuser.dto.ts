import { UserStatus } from '@domain/entities/user/user.entity';

export interface IBlockUserInput {
  userId: string;
  block: boolean;
}

export interface IBlockUserOutput {
  status: UserStatus;
}
