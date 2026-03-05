import {
  RegisterUserInput,
  RegisterUserOutput,
} from '@application/dtos/auth/registerUser.dto';
import { Result } from '@domain/shared/result';

export interface IRegisterUseCase {
  execute(data: RegisterUserInput): Promise<Result<RegisterUserOutput>>;
}
