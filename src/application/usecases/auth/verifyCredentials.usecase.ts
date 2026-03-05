import { IVerifyCredentialsUseCase } from '@application/interfaces/usecases/IVerifyCredentialsUseCase';
import { TYPES } from '@di/types.di';
import { OtpPurpose, OtpStatus } from '@domain/entities/otp/otp.entity';
import { IOtpRepository } from '@domain/repositories/IOtpRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Result } from '@domain/shared/result';
import { Email } from '@domain/value-objects/email.vo';
import { inject, injectable } from 'inversify';

@injectable()
export class VerifyCredentialsUseCase implements IVerifyCredentialsUseCase {
  constructor(
    @inject(TYPES.IOtpRepository)
    private readonly _otpRepository: IOtpRepository,
    @inject(TYPES.IUserRepository)
    private readonly _userRepository: IUserRepository,
  ) {}

  async execute(
    otp: string,
    email: string,
    purpose: OtpPurpose,
  ): Promise<Result<void>> {
    try {
      const emailVo = Email.create(email);
      if (emailVo.isFailure) {
        return Result.fail('Invalid email');
      }

      const userEntity = await this._userRepository.findByEmail(
        emailVo.getValue(),
      );
      if (!userEntity) {
        return Result.fail('User not found');
      }

      const otpEntity =
        await this._otpRepository.findRecentOtpByUserIdAndPurpose(
          userEntity.getId(),
          purpose,
        );

      if (!otpEntity) {
        return Result.fail('Otp not found');
      }

      if (otpEntity.getOtp() !== otp) {
        return Result.fail('Invalid otp');
      }

      if (otpEntity.getOtpStatus() !== OtpStatus.PENDING) {
        return Result.fail('Otp already verified');
      }

      otpEntity.setOtpStatus(OtpStatus.VERIFIED);
      await this._otpRepository.update(otpEntity);

      return Result.ok();
    } catch (error) {
      console.log(error);
      return Result.fail('UNEXPECTED ERROR FROM VERIFY CREDENTIALS USECASE');
    }
  }
}
