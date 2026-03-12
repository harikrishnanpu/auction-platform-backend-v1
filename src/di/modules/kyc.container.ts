import { IUploadKycGetUrlUsecase } from '@application/interfaces/usecases/kyc/IUploadKycGetUrlUsecase';
import { UploadKycUrlUseCase } from '@application/usecases/kyc/uploadKycUrl.usecase';
import { TYPES } from '@di/types.di';
import { ContainerModule } from 'inversify';

export const kycContainer = new ContainerModule(({ bind }) => {
  bind<IUploadKycGetUrlUsecase>(TYPES.IUploadKycGetUrlUsecase).to(
    UploadKycUrlUseCase,
  );
});
