import {
  IGetUserInput,
  IGetUserOutput,
} from '@application/dtos/admin/getUser.dto';
import { UserRoleType } from '@application/dtos/auth/loginUser.dto';
import { userResponseDto } from '@application/dtos/user/userResponse.dto';
import { IGetAdminUserUsecase } from '@application/interfaces/usecases/admin/IGetAdminUserUsecase';
import { TYPES } from '@di/types.di';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class GetAdminUserUseCase implements IGetAdminUserUsecase {
  constructor(
    @inject(TYPES.IUserRepository)
    private readonly _userRepository: IUserRepository,
  ) {}

  async execute(data: IGetUserInput): Promise<Result<IGetUserOutput>> {
    try {
      const { userId } = data;

      const userResult = await this._userRepository.findById(userId);

      if (userResult.isFailure) {
        return Result.fail(userResult.getError());
      }

      const user = userResult.getValue();

      const userResponseDto: userResponseDto = {
        id: user.getId(),
        name: user.getName(),
        email: user.getEmail().getValue(),
        phone: user.getPhone()?.getValue() ?? '',
        address: user.getAddress() ?? '',
        avatar_url: user.getAvatarUrl() ?? '',
        isProfileCompleted: user.isProfileCompleted(),
        isVerified: user.getIsVerified(),
        status: user.getStatus(),
        authProvider: user.getAuthProvider().getType(),
        roles: user.getRoles().map((role) => role.getValue() as UserRoleType),
      };

      return Result.ok({
        user: userResponseDto,
      });
    } catch (error) {
      console.log(error);
      return Result.fail('UNEXPECTED ERROR FROM GET USER USECASE');
    }
  }
}
