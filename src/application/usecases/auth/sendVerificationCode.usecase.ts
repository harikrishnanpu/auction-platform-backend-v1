import { EMAIL_TEMPLATES } from '@application/constants/template/email.template.constants';
import { IEmailService } from '@application/interfaces/services/IEmailService';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { IOtpService } from '@application/interfaces/services/IOtpService';
import { ISendVerificationCodeUsecase } from '@application/interfaces/usecases/auth/ISendVerificationCodeUsecase';
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
import { Email } from '@domain/value-objects/email.vo';
import { inject, injectable } from 'inversify';

@injectable()
export class SendVerificationCodeUsecase implements ISendVerificationCodeUsecase {
  constructor(
    @inject(TYPES.IUserRepository)
    private readonly _userRepository: IUserRepository,
    @inject(TYPES.IEmailService)
    private readonly _emailService: IEmailService,
    @inject(TYPES.IOtpService)
    private readonly _otpService: IOtpService,
    @inject(TYPES.IOtpRepository)
    private readonly _otpRepository: IOtpRepository,
    @inject(TYPES.IIdGeneratingService)
    private readonly _idGeneratingService: IIdGeneratingService,
  ) {}

  async execute(email: string): Promise<Result<void>> {
    try {
      const emailVo = Email.create(email);
      if (emailVo.isFailure) {
        return Result.fail('Invalid email');
      }

      const user = await this._userRepository.findByEmail(emailVo.getValue());
      if (!user) {
        return Result.fail('User not found');
      }

      const recentOtps =
        await this._otpRepository.findRecentOtpsByUserIdAndPurpose(
          user.getValue().getId(),
          OtpPurpose.VERIFY_EMAIL,
        );

      const MAX_OTPS_PER_PURPOSE = 3;
      // const MIN_TIME_BETWEEN_OTPS = 60 * 1000;

      const pendingOtps = recentOtps.filter(
        (otp) =>
          otp.getOtpStatus() === OtpStatus.PENDING &&
          otp.getCreatedAt() >= new Date(Date.now() - 60 * 60 * 1000),
      );

      if (pendingOtps.length >= MAX_OTPS_PER_PURPOSE) {
        return Result.fail('Too many otps sent');
      }

      const otp = this._otpService.generateOtp();

      const otpEntity = Otp.create({
        id: this._idGeneratingService.generateId(),
        userId: user.getValue().getId(),
        purpose: OtpPurpose.VERIFY_EMAIL,
        channel: OtpChannel.EMAIL,
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        status: OtpStatus.PENDING,
      });

      console.log('otp', otp);

      await this._otpRepository.save(otpEntity.getValue());

      await this._emailService.sendOtpEmail(
        emailVo.getValue(),
        otp,
        OtpPurpose.VERIFY_EMAIL,
        EMAIL_TEMPLATES.VERIFY_EMAIL,
      );

      return Result.ok();
    } catch (error) {
      console.log(error);
      return Result.fail(
        'UNEXPECTED ERROR FROM SEND VERIFICATION CODE USECASE',
      );
    }
  }
}
