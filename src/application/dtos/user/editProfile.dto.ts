import { userResponseDto } from './userResponse.dto';

export interface EditProfileInput {
  userId: string;
  otp: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface EditProfileOutput {
  user: userResponseDto;
}
