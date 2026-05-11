import { UpdateAvatarUrlResponseDto } from '@application/dtos/user/updateAvatar.dto';
import { Result } from '@domain/shared/result';
export interface IValidatedUpdateAvatarUrlInput {
    userId: string;
    fileKey: string;
}

export interface IUpdateAvatarUrlUsecase {
    execute(
        data: IValidatedUpdateAvatarUrlInput,
    ): Promise<Result<UpdateAvatarUrlResponseDto>>;
}
