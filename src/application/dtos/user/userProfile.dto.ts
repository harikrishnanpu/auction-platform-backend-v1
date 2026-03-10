import { userResponseDto } from './userResponse.dto';

export interface ChangeProfilePasswordInput {
  userId: string;
  otp: string;
  oldPassword: string;
  newPassword: string;
}

export interface ChangeProfilePasswordOutput {
  user: userResponseDto;
}
