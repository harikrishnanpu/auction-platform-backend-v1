import { GoogleUserDto } from '@application/dtos/auth/googleUser.dto';
import { userResponseDto } from '@application/dtos/user/userResponse.dto';
import { Result } from '@domain/shared/result';

export interface IGoogleAuthUsecase {
  execute(
    data: GoogleUserDto,
  ): Promise<
    Result<{ user: userResponseDto; accessToken: string; refreshToken: string }>
  >;
}
