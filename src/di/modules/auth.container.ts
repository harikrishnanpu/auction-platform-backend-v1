import { IEmailService } from '@application/interfaces/services/IEmailService';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { IOtpService } from '@application/interfaces/services/IOtpService';
import { IPasswordService } from '@application/interfaces/services/IPasswordService';
import { IRegisterUseCase } from '@application/interfaces/usecases/IRegisterUsecase';
import { RegisterUseCase } from '@application/usecases/auth/register.usecase';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { EmailQueue } from '@infrastructure/queue/email.queue';
import { PrismaUserRepo } from '@infrastructure/repositories/user/prisma-user.repo';
import { EmailService } from '@infrastructure/services/email/email.service';
import { IDGeneratingService } from '@infrastructure/services/id/idGenerate.service';
import { OtpService } from '@infrastructure/services/otp/otp.service';
import { TYPES } from '@di/types.di';
import { ContainerModule } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { Argon2Service } from '@infrastructure/security/argon2Service';
import { PasswordService } from '@infrastructure/services/password/password.service';
import { IOtpRepository } from '@domain/repositories/IOtpRepository';
import { PrismaOtpRepo } from '@infrastructure/repositories/otp/prisma-otp.repo';
import { ISendVerificationCodeUsecase } from '@application/interfaces/usecases/ISendVerificationCodeUsecase';
import { SendVerificationCodeUsecase } from '@application/usecases/auth/sendVerificationCode.usecase';

export const authContainer = new ContainerModule(({ bind }) => {
  console.log('Auth container loaded');

  bind<PrismaClient>(TYPES.PrismaClient).toConstantValue(new PrismaClient());
  bind<IUserRepository>(TYPES.IUserRepository).to(PrismaUserRepo);

  bind<IPasswordService>(TYPES.IPasswordService).to(PasswordService);
  bind<IEmailService>(TYPES.IEmailService).to(EmailService);
  bind<Argon2Service>(TYPES.Argon2Service).to(Argon2Service);
  bind<IIdGeneratingService>(TYPES.IIdGeneratingService).to(
    IDGeneratingService,
  );
  bind<IOtpService>(TYPES.IOtpService).to(OtpService);

  bind<IRegisterUseCase>(TYPES.IRegisterUseCase).to(RegisterUseCase);
  bind<EmailQueue>(TYPES.EmailQueue).to(EmailQueue);

  bind<IOtpRepository>(TYPES.IOtpRepository).to(PrismaOtpRepo);
  bind<ISendVerificationCodeUsecase>(TYPES.ISendVerificationCodeUsecase).to(
    SendVerificationCodeUsecase,
  );
});
