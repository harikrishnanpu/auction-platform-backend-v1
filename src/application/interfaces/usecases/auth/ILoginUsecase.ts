import {
  LoginUserInput,
  LoginUserOutput,
} from '@application/dtos/auth/loginUser.dto';
import { Result } from '@domain/shared/result';

export interface ILoginUseCase {
  execute(data: LoginUserInput): Promise<Result<LoginUserOutput>>;
}
