import { userResponseDto } from '../user/userResponse.dto';

export interface IGetUserInput {
  userId: string;
}

export interface IGetUserOutput {
  user: userResponseDto;
}
