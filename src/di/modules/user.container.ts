import { ISendOtpUsecase } from '@application/interfaces/usecases/otp/ISendOtpUsecase';
import { IChangeProfilePasswordUsecase } from '@application/interfaces/usecases/user/IChangeProfilePassword';
import { IEditProfileUsecase } from '@application/interfaces/usecases/user/IEditProfileUsecase';
import { ISendProfileChangePasswordOtpUsecase } from '@application/interfaces/usecases/user/ISentProfileChangePasswordOtpUsecase';
import { SendOtpUseCase } from '@application/usecases/otp/send-otp.usecase';
import { ChangeProfilePasswordUseCase } from '@application/usecases/user/changeProfilePassword.usecase';
import { EditProfileUseCase } from '@application/usecases/user/editProfile.usecase';
import { SendProfileChangePasswordOtpUsecase } from '@application/usecases/user/sendProfileChangePassword.usecase';
import { TYPES } from '@di/types.di';
import { OtpPolicyService } from '@domain/policies/otp-policy.service';
import { ContainerModule } from 'inversify';

export const userContainer = new ContainerModule(({ bind }) => {
  bind<ISendProfileChangePasswordOtpUsecase>(
    TYPES.ISendProfileChangePasswordOtpUsecase,
  ).to(SendProfileChangePasswordOtpUsecase);
  bind<IChangeProfilePasswordUsecase>(TYPES.IChangeProfilePasswordUsecase).to(
    ChangeProfilePasswordUseCase,
  );
  bind<ISendOtpUsecase>(TYPES.ISendOtpUsecase).to(SendOtpUseCase);
  bind<OtpPolicyService>(TYPES.OtpPolicyService).to(OtpPolicyService);

  bind<IEditProfileUsecase>(TYPES.IEditProfileUsecase).to(EditProfileUseCase);
});
