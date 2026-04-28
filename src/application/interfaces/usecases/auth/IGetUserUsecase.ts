import { userResponseDto } from '@application/dtos/user/userResponse.dto';
import { Result } from '@domain/shared/result';

export interface IGetUserUsecase {
    execute(id: string): Promise<Result<userResponseDto>>;
}
