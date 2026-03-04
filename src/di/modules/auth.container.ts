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
import { PasswordService } from '@infrastructure/services/password/password.service';
import { AuthController } from '@presentation/http/controllers/auth/auth.controller';
import { TYPES } from 'di/types.di';
import { ContainerModule } from 'inversify';

export const authContainer = new ContainerModule(({ bind }) => {
  bind<IUserRepository>(TYPES.IUserRepository).to(PrismaUserRepo);
  bind<IEmailService>(TYPES.IEmailService).to(EmailService);
  bind<IPasswordService>(TYPES.IPasswordService).to(PasswordService);
  bind<IIdGeneratingService>(TYPES.IIdGeneratingService).to(
    IDGeneratingService,
  );
  bind<IOtpService>(TYPES.IOtpService).to(OtpService);
  bind<IRegisterUseCase>(TYPES.IRegisterUseCase).to(RegisterUseCase);
  bind<AuthController>(TYPES.AuthController).to(AuthController);
  bind<EmailQueue>(TYPES.EmailQueue).to(EmailQueue);
});
