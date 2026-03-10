import { IEmailService } from '@application/interfaces/services/IEmailService';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { IOtpService } from '@application/interfaces/services/IOtpService';
import { ISendProfileChangePasswordOtpUsecase } from '@application/interfaces/usecases/user/ISentProfileChangePasswordOtpUsecase';
import { TYPES } from '@di/types.di';
import {
  Otp,
  OtpChannel,
  OtpPurpose,
  OtpStatus,
} from '@domain/entities/otp/otp.entity';
import { IOtpRepository } from '@domain/repositories/IOtpRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class SendProfileChangePasswordOtpUsecase implements ISendProfileChangePasswordOtpUsecase {
  constructor(
    @inject(TYPES.IUserRepository)
    private readonly _userRepository: IUserRepository,
    @inject(TYPES.IOtpService)
    private readonly _otpService: IOtpService,
    @inject(TYPES.IIdGeneratingService)
    private readonly _idGeneratingService: IIdGeneratingService,
    @inject(TYPES.IOtpRepository)
    private readonly _otpRepository: IOtpRepository,
    @inject(TYPES.IEmailService)
    private readonly _emailService: IEmailService,
  ) {}

  async execute(userId: string): Promise<Result<void>> {
    try {
      const user = await this._userRepository.findById(userId);
      if (user.isFailure) return Result.fail(user.getError());

      const otp = this._otpService.generateOtp();

      console.log(otp);

      const otpEntity = Otp.create({
        id: this._idGeneratingService.generateId(),
        userId: userId,
        purpose: OtpPurpose.CHANGE_PROFILE_PASSWORD,
        channel: OtpChannel.EMAIL,
        otp: otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        status: OtpStatus.PENDING,
      });

      if (otpEntity.isFailure) return Result.fail(otpEntity.getError());

      await this._otpRepository.save(otpEntity.getValue());

      await this._emailService.sendForgotPasswordEmail(
        user.getValue().getEmail(),
        otp,
      );

      return Result.ok();
    } catch (error) {
      console.log(error);
      return Result.fail(
        'UNEXPECTED ERROR FROM SEND PROFILE CHANGE PASSWORD OTP USECASE',
      );
    }
  }
}
