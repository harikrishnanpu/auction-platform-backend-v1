import { IStorageService } from '@application/interfaces/services/IStorageService';
import { ISendOtpUsecase } from '@application/interfaces/usecases/otp/ISendOtpUsecase';
import { IChangeProfilePasswordUsecase } from '@application/interfaces/usecases/user/IChangeProfilePassword';
import { IEditProfileUsecase } from '@application/interfaces/usecases/user/IEditProfileUsecase';
import { IGenerateAvatarUploadUrlUsecase } from '@application/interfaces/usecases/user/IGenerateAvatarUploadUrlUsecase';
import { ISendProfileChangePasswordOtpUsecase } from '@application/interfaces/usecases/user/ISentProfileChangePasswordOtpUsecase';
import { IUpdateAvatarUrlUsecase } from '@application/interfaces/usecases/user/IUpdateAvatarUrl';
import { SendOtpUseCase } from '@application/usecases/otp/send-otp.usecase';
import { ChangeProfilePasswordUseCase } from '@application/usecases/user/changeProfilePassword.usecase';
import { EditProfileUseCase } from '@application/usecases/user/editProfile.usecase';
import { GenerateAvatarUploadUrlUseCase } from '@application/usecases/user/generateAvatarUploadUrl.usecase';
import { SendProfileChangePasswordOtpUsecase } from '@application/usecases/user/sendProfileChangePassword.usecase';
import { UpdateAvatarUrlUseCase } from '@application/usecases/user/updateAvatarurl.usecase';
import { S3Client } from '@aws-sdk/client-s3';
import { TYPES } from '@di/types.di';
import { OtpPolicyService } from '@domain/policies/otp-policy.service';
import { s3Client } from '@infrastructure/services/storage/s3.client';
import { S3StorageService } from '@infrastructure/services/storage/storage.service';
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
  bind<IGenerateAvatarUploadUrlUsecase>(
    TYPES.IGenerateAvatarUploadUrlUsecase,
  ).to(GenerateAvatarUploadUrlUseCase);
  bind<IStorageService>(TYPES.IStorageService).to(S3StorageService);
  bind<S3Client>(TYPES.S3Client).toConstantValue(s3Client);
  bind<IUpdateAvatarUrlUsecase>(TYPES.IUpdateAvatarUrlUsecase).to(
    UpdateAvatarUrlUseCase,
  );
});
