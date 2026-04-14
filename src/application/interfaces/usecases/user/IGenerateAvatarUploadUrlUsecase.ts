import { AvatarUploadUrlResponseDto } from '@application/dtos/user/avatarUploadUrl.dto';
import { Result } from '@domain/shared/result';
import { ZodGenerateUploadUrlInputType } from '@presentation/validators/schemas/user/generate-upload-url.schema';

export interface IGenerateAvatarUploadUrlUsecase {
    execute(
        data: ZodGenerateUploadUrlInputType,
    ): Promise<Result<AvatarUploadUrlResponseDto>>;
}
