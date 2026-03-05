import {
  RegisterUserInput,
  RegisterUserOutput,
} from '@application/dtos/auth/registerUser.dto';
import { IEmailService } from '@application/interfaces/services/IEmailService';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { IOtpService } from '@application/interfaces/services/IOtpService';
import { IPasswordService } from '@application/interfaces/services/IPasswordService';
import { IRegisterUseCase } from '@application/interfaces/usecases/IRegisterUsecase';
import { User, UserStatus } from '@domain/entities/user/user.entity';
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
  ) {
    this.userRepository = userRepo;
  }

  async execute(dto: RegisterUserInput): Promise<Result<RegisterUserOutput>> {
    const { name, email, phone, password, address } = dto;

    const emailVo = Email.create(email);
    if (emailVo.isFailure) {
      return Result.fail(emailVo.getError());
    }

    const phoneVo = Phone.create(phone);
    if (phoneVo.isFailure) {
      return Result.fail(phoneVo.getError());
    }

    const existingUser = await this.userRepository.findByEmail(
      emailVo.getValue(),
    );

    if (existingUser) {
      return Result.fail('Email already exists');
    }

    const hashedPassword = await this._passwordService.hashPassword(password);

    const authProviderVo = AuthProvider.createLocal(hashedPassword);

    const userId = this._idGeneratingService.generateId();

    const userRoleVo = UserRole.USER;

    const userEntity = User.create({
      id: userId,
      name,
      email: emailVo.getValue(),
      phone: phoneVo.getValue(),
      authProvider: authProviderVo,
      address: address,
      roles: [userRoleVo],
      status: UserStatus.ACTIVE,
    });

    if (userEntity.isFailure) {
      return Result.fail(userEntity.getError());
    }

    await this.userRepository.save(userEntity.getValue());
    const otp = this._otpService.generateOtp();
    await this._emailService.sendVerificationEmail(emailVo.getValue(), otp);

    return Result.ok<RegisterUserOutput>({
      userId: userEntity.getValue().getId(),
    });
  }
}
