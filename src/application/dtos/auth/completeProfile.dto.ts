import { userResponseDto } from '../user/userResponse.dto';

export interface CompleteProfileInput {
  userId: string;
  phone: string;
  address: string;
}

export interface CompleteProfileOutput {
  user: userResponseDto;
}
