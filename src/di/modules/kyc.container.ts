import { IGetKycStatusUsecase } from '@application/interfaces/usecases/kyc/IGetKycStatusUsecase';
import { IGetKycUploadUrlUsecase } from '@application/interfaces/usecases/kyc/IGetKycUploadUrlUsecase';
import { ISubmitKycUsecase } from '@application/interfaces/usecases/kyc/ISubmitKycUsecase';
import { IUpdateKycUsecase } from '@application/interfaces/usecases/kyc/IUpdateKyc';
import { GetKycStatusUseCase } from '@application/usecases/kyc/getKycStatus.usecase';
import { GetKycUploadUrlUseCase } from '@application/usecases/kyc/getKycUploadUrl.usecase';
import { SubmitKycUsecase } from '@application/usecases/kyc/submitKyc.usecase';
import { UpdateKycUseCase } from '@application/usecases/kyc/updateKyc.usecase';
import { TYPES } from '@di/types.di';
import { IKycDocumentRepository } from '@domain/repositories/IKycDocumentRepository';
import { IKycRepository } from '@domain/repositories/IKycRespository';
import { PrismaKycDocumentRepo } from '@infrastructure/repositories/kyc/kyc-document.repo';
import { PrismaKycRepo } from '@infrastructure/repositories/kyc/kyc.repo';
import { ContainerModule } from 'inversify';

export const kycContainer = new ContainerModule(({ bind }) => {
  bind<IGetKycUploadUrlUsecase>(TYPES.IGetKycUploadUrlUsecase).to(
    GetKycUploadUrlUseCase,
  );
  bind<IGetKycStatusUsecase>(TYPES.IGetKycStatusUsecase).to(
    GetKycStatusUseCase,
  );
  bind<IKycRepository>(TYPES.IKycRepository).to(PrismaKycRepo);
  bind<IUpdateKycUsecase>(TYPES.IUpdateKycUsecase).to(UpdateKycUseCase);
  bind<IKycDocumentRepository>(TYPES.IKycDocumentRepository).to(
    PrismaKycDocumentRepo,
  );
  bind<ISubmitKycUsecase>(TYPES.ISubmitKycUsecase).to(SubmitKycUsecase);
});
