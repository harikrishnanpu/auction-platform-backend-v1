import {
  userResponseDto,
  UserRoleType,
} from '@application/dtos/auth/loginUser.dto';
import { IGetUserUsecase } from '@application/interfaces/usecases/IGetUserUsecase';
import { TYPES } from '@di/types.di';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class GetUserUseCase implements IGetUserUsecase {
  constructor(
    @inject(TYPES.IUserRepository)
    private readonly _userRepository: IUserRepository,
  ) {}

  async execute(id: string): Promise<Result<userResponseDto>> {
    console.log('GETUSER USECASE CALLED --');
    const userResult = await this._userRepository.findById(id);
    console.log('userResult is', userResult);
    if (userResult.isFailure) return Result.fail(userResult.getError());

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

    return Result.ok(userResponseDto);
  }
}
