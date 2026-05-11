import { EditProfileOutput } from '@application/dtos/user/editProfile.dto';
import { Result } from '@domain/shared/result';
export interface IValidatedEditProfileInput {
    userId: string;
    otp: string;
    email: string;
    name: string;
    phone: string;
    address: string;
}

export interface IEditProfileUsecase {
    execute(
        data: IValidatedEditProfileInput,
    ): Promise<Result<EditProfileOutput>>;
}
