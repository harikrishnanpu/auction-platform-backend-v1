import { UpdateAvatarUrlResponseDto } from '@application/dtos/user/updateAvatar.dto';
import { Result } from '@domain/shared/result';
import { ZodUpdateAvatarUrlInputType } from '@presentation/validators/schemas/user/update-avatar-url.schema';

export interface IUpdateAvatarUrlUsecase {
    execute(
        data: ZodUpdateAvatarUrlInputType,
    ): Promise<Result<UpdateAvatarUrlResponseDto>>;
}
