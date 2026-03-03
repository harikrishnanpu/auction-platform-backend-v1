import {
  RegisterUserInput,
  RegisterUserOutput,
} from '@application/dtos/auth/registerUser.dto';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { IPasswordService } from '@application/interfaces/services/IPasswordService';
import { IRegisterUseCase } from '@application/interfaces/usecases/IRegisterUsecase';
import { User } from '@domain/entities/user.entity';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Result } from '@domain/shared/result';
import { AuthProvider } from '@domain/value-objects/auth-provider.vo';
import { Email } from '@domain/value-objects/email.vo';
import { Phone } from '@domain/value-objects/phone.vo';

export class RegisterUseCase implements IRegisterUseCase {
  private userRepository: IUserRepository;

  constructor(
    userRepo: IUserRepository,
    private passwordService: IPasswordService,
    private idGeneratingService: IIdGeneratingService,
  ) {
    this.userRepository = userRepo;
  }

  async execute(dto: RegisterUserInput): Promise<Result<RegisterUserOutput>> {
    const { name, email, phone, password } = dto;

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

    const hashedPassword = await this.passwordService.hashPassword(password);

    const authProviderVo = AuthProvider.createLocal(hashedPassword);

    const userId = this.idGeneratingService.generateId();

    const userEntity = User.create({
      id: userId,
      name,
      email: emailVo.getValue(),
      phone: phoneVo.getValue(),
      authProvider: authProviderVo,
    });

    if (userEntity.isFailure) {
      return Result.fail(userEntity.getError());
    }

    await this.userRepository.save(userEntity.getValue());

    return Result.ok<RegisterUserOutput>({
      message: 'User registered successfully',
      userId: userEntity.getValue().getId(),
    });
  }
}
