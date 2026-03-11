import {
  AvatarUploadUrlRequestDto,
  AvatarUploadUrlResponseDto,
} from '@application/dtos/user/avatarUploadUrl.dto';
import { Result } from '@domain/shared/result';

export interface IGenerateAvatarUploadUrlUsecase {
  execute(
    data: AvatarUploadUrlRequestDto,
  ): Promise<Result<AvatarUploadUrlResponseDto>>;
}
