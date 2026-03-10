import { GoogleUserDto } from '@application/dtos/auth/googleUser.dto';
import { UserRoleType } from '@application/dtos/auth/loginUser.dto';
import { userResponseDto } from '@application/dtos/user/userResponse.dto';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { ITokenGeneratorService } from '@application/interfaces/services/ITokenGeneratorService';
import { IGoogleAuthUsecase } from '@application/interfaces/usecases/auth/IGoogleAuthUsecase';
import { TYPES } from '@di/types.di';
import {
  AuthProviderType,
  User,
  UserStatus,
} from '@domain/entities/user/user.entity';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Result } from '@domain/shared/result';
import { AuthProvider } from '@domain/value-objects/auth-provider.vo';
import { Email } from '@domain/value-objects/email.vo';
import { UserRole } from '@domain/value-objects/user-roles.vo';
import { inject, injectable } from 'inversify';

@injectable()
export class GoogleAuthUsecase implements IGoogleAuthUsecase {
  constructor(
    @inject(TYPES.IUserRepository)
    private readonly _userRepository: IUserRepository,
    @inject(TYPES.ITokenGeneratorService)
    private readonly _tokenGenerator: ITokenGeneratorService,
    @inject(TYPES.IIdGeneratingService)
    private readonly _idGeneratingService: IIdGeneratingService,
  ) {}

  async execute(
    data: GoogleUserDto,
  ): Promise<
    Result<{ user: userResponseDto; accessToken: string; refreshToken: string }>
  > {
    const emailVo = Email.create(data.email);
    if (emailVo.isFailure) {
      return Result.fail(emailVo.getError());
    }

    const userEntity = await this._userRepository.findByEmail(
      emailVo.getValue(),
    );

    if (userEntity.isSuccess) {
      const user = userEntity.getValue();

      const userResponseDto: userResponseDto = {
        id: user.getId(),
        name: user.getName(),
        email: user.getEmail().getValue(),
        phone: user.getPhone()?.getValue() ?? '',
        address: user.getAddress() ?? '',
        isProfileCompleted: user.isProfileCompleted(),
        isVerified: user.getIsVerified(),
        status: user.getStatus(),
        authProvider: user.getAuthProvider().getType(),
        roles: user.getRoles().map((role) => role.getValue() as UserRoleType),
        avatar_url: user.getAvatarUrl() ?? '',
      };

      const accessToken = this._tokenGenerator.generateAccessToken(
        user.getId(),
      );
      const refreshToken = this._tokenGenerator.generateRefreshToken(
        user.getId(),
      );

      return Result.ok({
        user: userResponseDto,
        accessToken,
        refreshToken,
      });
    }

    const userId = this._idGeneratingService.generateId();

    const authProviderVo = AuthProvider.createOAuth(
      AuthProviderType.GOOGLE,
      data.googleId,
    );

    const newUserEntity = User.create({
      id: userId,
      name: data.name,
      email: emailVo.getValue(),
      authProvider: authProviderVo,
      roles: [UserRole.USER],
      isVerified: false,
      avatar_url: data.avatar,
      address: null,
      status: UserStatus.ACTIVE,
    });

    if (newUserEntity.isFailure) {
      return Result.fail(newUserEntity.getError());
    }

    await this._userRepository.save(newUserEntity.getValue());

    const accessToken = this._tokenGenerator.generateAccessToken(
      newUserEntity.getValue().getId(),
    );
    const refreshToken = this._tokenGenerator.generateRefreshToken(
      newUserEntity.getValue().getId(),
    );

    const userResponseDto: userResponseDto = {
      id: newUserEntity.getValue().getId(),
      name: newUserEntity.getValue().getName(),
      email: newUserEntity.getValue().getEmail().getValue(),
      phone: newUserEntity.getValue().getPhone()?.getValue() ?? '',
      address: newUserEntity.getValue().getAddress() ?? '',
      avatar_url: newUserEntity.getValue().getAvatarUrl() ?? '',
      isProfileCompleted: newUserEntity.getValue().isProfileCompleted(),
      isVerified: newUserEntity.getValue().getIsVerified(),
      status: newUserEntity.getValue().getStatus(),
      authProvider: newUserEntity.getValue().getAuthProvider().getType(),
      roles: newUserEntity
        .getValue()
        .getRoles()
        .map((role) => role.getValue() as UserRoleType),
    };

    return Result.ok({
      user: userResponseDto,
      accessToken,
      refreshToken,
    });
  }
}
