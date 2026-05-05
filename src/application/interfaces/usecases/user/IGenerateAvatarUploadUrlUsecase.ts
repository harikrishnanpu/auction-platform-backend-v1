import { AvatarUploadUrlResponseDto } from '@application/dtos/user/avatarUploadUrl.dto';
import { Result } from '@domain/shared/result';
export interface IValidatedGenerateAvatarUploadUrlInput {
    userId: string;
    contentType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
    fileName: string;
    fileSize: number;
}

export interface IGenerateAvatarUploadUrlUsecase {
    execute(
        data: IValidatedGenerateAvatarUploadUrlInput,
    ): Promise<Result<AvatarUploadUrlResponseDto>>;
}
