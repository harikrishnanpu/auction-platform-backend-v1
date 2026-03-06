import {
  LoginUserInput,
  LoginUserOutput,
} from '@application/dtos/auth/loginUser.dto';
import { IPasswordService } from '@application/interfaces/services/IPasswordService';
import { ITokenGeneratorService } from '@application/interfaces/services/ITokenGeneratorService';
import { ILoginUseCase } from '@application/interfaces/usecases/ILoginUsecase';
import { TYPES } from '@di/types.di';
import { AuthProviderType } from '@domain/entities/user/user.entity';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Result } from '@domain/shared/result';
import { Email } from '@domain/value-objects/email.vo';
import { inject, injectable } from 'inversify';

@injectable()
export class LoginUseCase implements ILoginUseCase {
  constructor(
    @inject(TYPES.IUserRepository)
    private readonly _userRepository: IUserRepository,
    @inject(TYPES.IPasswordService)
    private readonly _passwordService: IPasswordService,
    @inject(TYPES.ITokenGeneratorService)
    private readonly _tokenGeneratorService: ITokenGeneratorService,
  ) {}

  async execute(data: LoginUserInput): Promise<Result<LoginUserOutput>> {
    try {
      const emailVo = Email.create(data.email);
      if (emailVo.isFailure) {
        return Result.fail('Invalid email');
      }

      const userEntity = await this._userRepository.findByEmail(
        emailVo.getValue(),
      );

      if (userEntity.isFailure) {
        return Result.fail(userEntity.getError());
      }

      if (
        userEntity.getValue().getAuthProvider().getType() !==
        AuthProviderType.LOCAL
      ) {
        return Result.fail('Invalid auth provider');
      }

      const passwordHash = userEntity
        .getValue()
        .getAuthProvider()
        .getPasswordHash();
      if (passwordHash.isFailure) {
        return Result.fail(passwordHash.getError());
      }

      console.log(passwordHash.getValue());

      const passwordMatch = await this._passwordService.comparePassword(
        data.password,
        passwordHash.getValue(),
      );

      if (!passwordMatch) {
        return Result.fail('Invalid password');
      }

      const accessToken = this._tokenGeneratorService.generateAccessToken(
        userEntity.getValue().getId(),
      );
      const refreshToken = this._tokenGeneratorService.generateRefreshToken(
        userEntity.getValue().getId(),
      );

      return Result.ok({
        user: userEntity.getValue(),
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.log(error);
      return Result.fail('UNEXPECTED ERROR FROM LOGIN USECASE');
    }
  }
}
