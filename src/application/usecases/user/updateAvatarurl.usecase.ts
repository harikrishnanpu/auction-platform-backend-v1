import { UserRoleType } from '@application/dtos/auth/loginUser.dto';
import {
  UpdateAvatarUrlRequestDto,
  UpdateAvatarUrlResponseDto,
} from '@application/dtos/user/updateAvatar.dto';
import { userResponseDto } from '@application/dtos/user/userResponse.dto';
import { GenerateDownloadUrlData } from '@application/interfaces/services/IStorageService';
import { IUpdateAvatarUrlUsecase } from '@application/interfaces/usecases/user/IUpdateAvatarUrl';
import { TYPES } from '@di/types.di';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class UpdateAvatarUrlUseCase implements IUpdateAvatarUrlUsecase {
  constructor(
    @inject(TYPES.IUserRepository)
    private readonly _userRepository: IUserRepository,
  ) {}

  async execute(
    data: UpdateAvatarUrlRequestDto,
  ): Promise<Result<UpdateAvatarUrlResponseDto>> {
    try {
      const userEntity = await this._userRepository.findById(data.userId);

      if (userEntity.isFailure) {
        return Result.fail(userEntity.getError());
      }

      userEntity.getValue().setAvatarUrl(data.avatarKey);

      await this._userRepository.save(userEntity.getValue());
      console.log('userEntity', userEntity.getValue());

      const generateDownloadUrlData: GenerateDownloadUrlData = {
        fileKey: data.avatarKey,
      };

      console.log('generateDownloadUrlData', generateDownloadUrlData);

      const userResponseDto: userResponseDto = {
        id: userEntity.getValue().getId(),
        name: userEntity.getValue().getName(),
        email: userEntity.getValue().getEmail().getValue(),
        phone: userEntity.getValue().getPhone()?.getValue() ?? '',
        address: userEntity.getValue().getAddress() ?? '',
        avatar_url: userEntity.getValue().getAvatarUrl() ?? '',
        authProvider: userEntity.getValue().getAuthProvider().getType(),
        isProfileCompleted: userEntity.getValue().isProfileCompleted(),
        isVerified: userEntity.getValue().getIsVerified(),
        status: userEntity.getValue().getStatus(),
        roles: userEntity
          .getValue()
          .getRoles()
          .map((role) => role.getValue() as UserRoleType),
      };

      return Result.ok({
        user: userResponseDto,
      });
    } catch (err) {
      console.log(err);
      return Result.fail('UNEXPECTED ERROR FROM UPDATE AVATAR URL USECASE');
    }
  }
}
