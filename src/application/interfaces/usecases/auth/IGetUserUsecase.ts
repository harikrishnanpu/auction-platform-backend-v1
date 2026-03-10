import { userResponseDto } from '@application/dtos/auth/loginUser.dto';
import { Result } from '@domain/shared/result';

export interface IGetUserUsecase {
  execute(id: string): Promise<Result<userResponseDto>>;
}
