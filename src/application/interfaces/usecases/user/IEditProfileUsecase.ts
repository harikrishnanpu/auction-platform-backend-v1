import {
  EditProfileInput,
  EditProfileOutput,
} from '@application/dtos/user/editProfile.dto';
import { Result } from '@domain/shared/result';

export interface IEditProfileUsecase {
  execute(data: EditProfileInput): Promise<Result<EditProfileOutput>>;
}
