import { userResponseDto } from './userResponse.dto';

export interface UpdateAvatarUrlRequestDto {
  userId: string;
  avatarKey: string;
}

export interface UpdateAvatarUrlResponseDto {
  user: userResponseDto;
}
