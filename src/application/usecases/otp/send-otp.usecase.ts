import { EMAIL_TEMPLATES } from '@application/constants/template/email.template.constants';
import { SendVerificationCodeInputDto } from '@application/dtos/otp/SendOtp.dto';
import { IEmailService } from '@application/interfaces/services/IEmailService';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { IOtpService } from '@application/interfaces/services/IOtpService';
import { ISendOtpUsecase } from '@application/interfaces/usecases/otp/ISendOtpUsecase';
import { TYPES } from '@di/types.di';
import { Otp, OtpStatus } from '@domain/entities/otp/otp.entity';
import { OtpPolicyService } from '@domain/policies/otp-policy.service';
import { IOtpRepository } from '@domain/repositories/IOtpRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Result } from '@domain/shared/result';
import { Email } from '@domain/value-objects/email.vo';
import { inject, injectable } from 'inversify';

@injectable()
export class SendOtpUseCase implements ISendOtpUsecase {
  constructor(
    @inject(TYPES.IUserRepository)
    private readonly _userRepository: IUserRepository,
    @inject(TYPES.IOtpService)
    private readonly _otpService: IOtpService,
    @inject(TYPES.IIdGeneratingService)
    private readonly _idGeneratingService: IIdGeneratingService,
    @inject(TYPES.IOtpRepository)
    private readonly _otpRepository: IOtpRepository,
    @inject(TYPES.OtpPolicyService)
    private readonly _otpPolicyService: OtpPolicyService,
    @inject(TYPES.IEmailService)
    private readonly _emailService: IEmailService,
  ) {}

  async execute(data: SendVerificationCodeInputDto): Promise<Result<void>> {
    try {
      const emailVo = Email.create(data.email);
      if (emailVo.isFailure) {
        return Result.fail(emailVo.getError());
      }

      const user = await this._userRepository.findByEmail(emailVo.getValue());
      if (user.isFailure) {
        return Result.fail(user.getError());
      }

      const previousOtps =
        await this._otpRepository.findRecentOtpsByUserIdAndPurpose(
          user.getValue().getId(),
          data.purpose,
        );

      if (!this._otpPolicyService.canGenerateOtp(previousOtps)) {
        return Result.fail('Too many otps sent');
      }

      const otp = this._otpService.generateOtp();
      console.log('otp is', otp);

      const otpEntity = Otp.create({
        id: this._idGeneratingService.generateId(),
        userId: user.getValue().getId(),
        purpose: data.purpose,
        channel: data.channel,
        otp: otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        status: OtpStatus.PENDING,
      });

      if (otpEntity.isFailure) {
        return Result.fail(otpEntity.getError());
      }

      await this._otpRepository.save(otpEntity.getValue());
      await this._emailService.sendOtpEmail(
        user.getValue().getEmail(),
        otp,
        data.purpose,
        EMAIL_TEMPLATES.CHANGE_PROFILE_PASSWORD,
      );

      return Result.ok();
    } catch (error) {
      console.log(error);
      return Result.fail('UNEXPECTED ERROR FROM SEND OTP USECASE');
    }
  }
}
