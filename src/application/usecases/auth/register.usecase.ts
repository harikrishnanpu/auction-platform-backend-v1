import { EMAIL_TEMPLATES } from '@application/constants/template/email.template.constants';
import {
  RegisterUserInput,
  RegisterUserOutput,
} from '@application/dtos/auth/registerUser.dto';
import { IEmailService } from '@application/interfaces/services/IEmailService';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { IOtpService } from '@application/interfaces/services/IOtpService';
import { IPasswordService } from '@application/interfaces/services/IPasswordService';
import { IRegisterUseCase } from '@application/interfaces/usecases/auth/IRegisterUsecase';
import {
  Otp,
  OtpChannel,
  OtpPurpose,
  OtpStatus,
} from '@domain/entities/otp/otp.entity';
import { User, UserStatus } from '@domain/entities/user/user.entity';
import { IOtpRepository } from '@domain/repositories/IOtpRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Result } from '@domain/shared/result';
import { AuthProvider } from '@domain/value-objects/auth-provider.vo';
import { Email } from '@domain/value-objects/email.vo';
import { Phone } from '@domain/value-objects/phone.vo';
import { UserRole } from '@domain/value-objects/user-roles.vo';
import { TYPES } from 'di/types.di';
import { inject, injectable } from 'inversify';

@injectable()
export class RegisterUseCase implements IRegisterUseCase {
  private userRepository: IUserRepository;

  constructor(
    @inject(TYPES.IUserRepository)
    userRepo: IUserRepository,
    @inject(TYPES.IPasswordService)
    private _passwordService: IPasswordService,
    @inject(TYPES.IIdGeneratingService)
    private _idGeneratingService: IIdGeneratingService,
    @inject(TYPES.IOtpService)
    private _otpService: IOtpService,
    @inject(TYPES.IEmailService)
    private _emailService: IEmailService,
    @inject(TYPES.IOtpRepository)
    private _otpRepository: IOtpRepository,
  ) {
    this.userRepository = userRepo;
  }

  async execute(dto: RegisterUserInput): Promise<Result<RegisterUserOutput>> {
    try {
      const { name, email, phone, password, address } = dto;

      const emailVo = Email.create(email);
      if (emailVo.isFailure) {
        return Result.fail(emailVo.getError());
      }

      const phoneVo = Phone.create(phone);
      if (phoneVo.isFailure) {
        return Result.fail(phoneVo.getError());
      }

      const [emailUser, phoneUser] = await Promise.all([
        this.userRepository.findByEmail(emailVo.getValue()),
        this.userRepository.findByPhone(phoneVo.getValue()),
      ]);

      if (emailUser.isSuccess || phoneUser.isSuccess) {
        return Result.fail('Email or Phone already exists');
      }

      const hashedPassword = await this._passwordService.hashPassword(password);

      const authProviderVo = AuthProvider.createLocal(hashedPassword);
      if (authProviderVo.isFailure) {
        return Result.fail(authProviderVo.getError());
      }

      const userId = this._idGeneratingService.generateId();

      const userRoleVo = UserRole.USER;

      const userEntity = User.create({
        id: userId,
        name,
        email: emailVo.getValue(),
        phone: phoneVo.getValue(),
        authProvider: authProviderVo.getValue(),
        address: address,
        roles: [userRoleVo],
        status: UserStatus.ACTIVE,
      });

      if (userEntity.isFailure) {
        return Result.fail(userEntity.getError());
      }

      await this.userRepository.save(userEntity.getValue());
      const otp = this._otpService.generateOtp();
      console.log('otp is', otp);

      const otpEntity = Otp.create({
        id: this._idGeneratingService.generateId(),
        userId: userId,
        purpose: OtpPurpose.VERIFY_EMAIL,
        channel: OtpChannel.EMAIL,
        otp: otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        status: OtpStatus.PENDING,
      });

      if (otpEntity.isFailure) {
        return Result.fail(otpEntity.getError());
      }

      await this._otpRepository.save(otpEntity.getValue());
      await this._emailService.sendOtpEmail(
        emailVo.getValue(),
        otp,
        OtpPurpose.VERIFY_EMAIL,
        EMAIL_TEMPLATES.VERIFY_EMAIL,
      );

      return Result.ok<RegisterUserOutput>({
        userId: userEntity.getValue().getId(),
      });
    } catch (err) {
      console.log(err);
      return Result.fail('UNEXPECTED_ERROR_FROM_REGISTER_USECASE');
    }
  }
}
