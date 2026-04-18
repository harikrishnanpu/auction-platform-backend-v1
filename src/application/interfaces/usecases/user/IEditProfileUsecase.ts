import { EditProfileOutput } from '@application/dtos/user/editProfile.dto';
import { Result } from '@domain/shared/result';
import { ZodEditProfileInputType } from '@presentation/validators/schemas/user/editProfile.schema';

export interface IEditProfileUsecase {
    execute(data: ZodEditProfileInputType): Promise<Result<EditProfileOutput>>;
}
