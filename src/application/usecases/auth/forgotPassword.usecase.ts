import { EMAIL_TEMPLATES } from '@application/constants/template/email.template.constants';
import { ForgotPasswordInput } from '@application/dtos/auth/forgotPassword.dto';
import { IEmailService } from '@application/interfaces/services/IEmailService';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { ITokenGeneratorService } from '@application/interfaces/services/ITokenGeneratorService';
import { IForgotPasswordUsecase } from '@application/interfaces/usecases/auth/IForgotPasswordUsecase';
import { TYPES } from '@di/types.di';
import {
  Otp,
  OtpChannel,
  OtpPurpose,
  OtpStatus,
} from '@domain/entities/otp/otp.entity';
import { AuthProviderType } from '@domain/entities/user/user.entity';
import { IOtpRepository } from '@domain/repositories/IOtpRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Result } from '@domain/shared/result';
import { Email } from '@domain/value-objects/email.vo';
import { inject, injectable } from 'inversify';

@injectable()
export class ForgotPasswordUsecase implements IForgotPasswordUsecase {
  constructor(
    @inject(TYPES.IUserRepository)
    private readonly _userRepository: IUserRepository,
    @inject(TYPES.ITokenGeneratorService)
    private readonly _tokenGeneratorService: ITokenGeneratorService,
    @inject(TYPES.IEmailService)
    private readonly _emailService: IEmailService,
    @inject(TYPES.IOtpRepository)
    private readonly _otpRepository: IOtpRepository,
    @inject(TYPES.IIdGeneratingService)
    private readonly _idGeneratingService: IIdGeneratingService,
  ) {}

  async execute(data: ForgotPasswordInput): Promise<Result<void>> {
    const emailVo = Email.create(data.email);
    if (emailVo.isFailure) return Result.fail(emailVo.getError());

    const user = await this._userRepository.findByEmail(emailVo.getValue());
    if (user.isFailure) return Result.fail(user.getError());

    if (
      user.getValue().getAuthProvider().getType() !== AuthProviderType.LOCAL
    ) {
      return Result.fail('Only local auth can reset password');
    }

    const token = this._tokenGeneratorService.generateToken(
      user.getValue().getId(),
    );

    const id = this._idGeneratingService.generateId();

    const otpEntity = Otp.create({
      id: id,
      userId: user.getValue().getId(),
      purpose: OtpPurpose.RESET_PASSWORD,
      channel: OtpChannel.EMAIL,
      otp: token,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      status: OtpStatus.PENDING,
    });

    if (otpEntity.isFailure) return Result.fail(otpEntity.getError());

    await this._otpRepository.save(otpEntity.getValue());

    const url = `${process.env.FRONTEND_URL}/reset/password/change?token=${token}`;
    await this._emailService.sendOtpEmail(
      emailVo.getValue(),
      url,
      OtpPurpose.RESET_PASSWORD,
      EMAIL_TEMPLATES.RESET_PASSWORD,
    );

    return Result.ok();
  }
}
