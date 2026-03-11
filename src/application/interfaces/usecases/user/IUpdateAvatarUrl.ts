import {
  UpdateAvatarUrlRequestDto,
  UpdateAvatarUrlResponseDto,
} from '@application/dtos/user/updateAvatar.dto';
import { Result } from '@domain/shared/result';

export interface IUpdateAvatarUrlUsecase {
  execute(
    data: UpdateAvatarUrlRequestDto,
  ): Promise<Result<UpdateAvatarUrlResponseDto>>;
}
