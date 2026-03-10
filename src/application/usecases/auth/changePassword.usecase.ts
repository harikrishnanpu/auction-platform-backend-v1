import { ChangePasswordInput } from '@application/dtos/auth/changePassword.dto';
import { IPasswordService } from '@application/interfaces/services/IPasswordService';
import { ITokenGeneratorService } from '@application/interfaces/services/ITokenGeneratorService';
import { IChangePasswordUsecase } from '@application/interfaces/usecases/auth/IChangePasswordUsecase';
import { TYPES } from '@di/types.di';
import { OtpPurpose, OtpStatus } from '@domain/entities/otp/otp.entity';
import { IOtpRepository } from '@domain/repositories/IOtpRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Result } from '@domain/shared/result';
import { AuthProvider } from '@domain/value-objects/auth-provider.vo';
import { inject, injectable } from 'inversify';

@injectable()
export class ChangePasswordUsecase implements IChangePasswordUsecase {
  constructor(
    @inject(TYPES.ITokenGeneratorService)
    private readonly _tokenGeneratorService: ITokenGeneratorService,
    @inject(TYPES.IUserRepository)
    private readonly _userRepository: IUserRepository,
    @inject(TYPES.IPasswordService)
    private readonly _passwordService: IPasswordService,
    @inject(TYPES.IOtpRepository)
    private readonly _otpRepository: IOtpRepository,
  ) {}

  async execute(data: ChangePasswordInput): Promise<Result<null>> {
    const { token, newPassword } = data;

    const tokenPayload = this._tokenGeneratorService.verifyToken(token);

    console.log('tokenPayload', tokenPayload);

    if (!tokenPayload) {
      return Result.fail('Invalid token');
    }

    const otpEntity = await this._otpRepository.findRecentOtpByUserIdAndPurpose(
      tokenPayload,
      OtpPurpose.RESET_PASSWORD,
    );

    if (!otpEntity) {
      return Result.fail('Invalid token');
    }

    if (otpEntity.isOtpBlocked()) {
      return Result.fail('token blocked');
    }

    if (otpEntity.getOtpStatus() !== OtpStatus.PENDING) {
      return Result.fail('token already verified');
    }

    if (otpEntity.getOtp() !== token) {
      otpEntity.incrementAttempts();
      await this._otpRepository.update(otpEntity);
      return Result.fail('Invalid token');
    }

    const userEntity = await this._userRepository.findById(tokenPayload);

    if (userEntity.isFailure) {
      return Result.fail(userEntity.getError());
    }

    const hashedPassword =
      await this._passwordService.hashPassword(newPassword);

    const authProviderVo = AuthProvider.createLocal(hashedPassword);

    if (authProviderVo.isFailure) {
      return Result.fail(authProviderVo.getError());
    }

    userEntity.getValue().setAuthProvider(authProviderVo.getValue());

    otpEntity.setOtpStatus(OtpStatus.VERIFIED);
    await this._otpRepository.update(otpEntity);
    await this._userRepository.save(userEntity.getValue());

    return Result.ok(null);
  }
}
