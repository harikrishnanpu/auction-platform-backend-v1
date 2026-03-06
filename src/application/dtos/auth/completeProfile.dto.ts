import { userResponseDto } from '../user/userResponse.dto';

export interface CompleteProfileInput {
  userId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface CompleteProfileOutput {
  user: userResponseDto;
  accessToken: string;
  refreshToken: string;
}
