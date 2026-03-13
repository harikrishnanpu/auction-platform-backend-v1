import {
  IGetKycStatusInput,
  IGetKycStatusOutput,
} from '@application/dtos/kyc/get-kyc-status.usecase';
import { IKycResponseDto } from '@application/dtos/kyc/kyc.response.dto';
import { IStorageService } from '@application/interfaces/services/IStorageService';
import { IGetKycStatusUsecase } from '@application/interfaces/usecases/kyc/IGetKycStatusUsecase';
import { TYPES } from '@di/types.di';
import {
  DocumentSide,
  DocumentStatus,
  DocumentType,
} from '@domain/entities/kyc/kyc-document.entity';
import { KycStatus } from '@domain/entities/kyc/kyc.entity';
import { IKycRepository } from '@domain/repositories/IKycRespository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class GetKycStatusUseCase implements IGetKycStatusUsecase {
  constructor(
    @inject(TYPES.IKycRepository)
    private readonly _kycRepository: IKycRepository,
    @inject(TYPES.IUserRepository)
    private readonly _userRepository: IUserRepository,
    @inject(TYPES.IStorageService)
    private readonly _storageService: IStorageService,
  ) {}

  async execute(
    data: IGetKycStatusInput,
  ): Promise<Result<IGetKycStatusOutput>> {
    const userEntity = await this._userRepository.findById(data.userId);

    if (userEntity.isFailure) return Result.fail(userEntity.getError());

    const user = userEntity.getValue();

    const kycEntity = await this._kycRepository.findByUserIdAndFor(
      user.getId(),
      data.kycFor,
    );

    if (kycEntity.isFailure) return Result.fail(kycEntity.getError());

    const kyc = kycEntity.getValue();

    if (!kyc)
      return Result.ok({
        kyc: null,
        status: KycStatus.NOT_SUBMITTED,
      });

    const documents = await Promise.all(
      kyc.getDocuments().map(async (document) => {
        let docUrl = '';
        const docUrlResult = await this._storageService.generateDownloadUrl({
          fileKey: document.getDocumentUrl(),
        });
        if (docUrlResult.isSuccess) {
          docUrl = docUrlResult.getValue();
        }
        return {
          id: document.getId(),
          kycId: document.getKycId(),
          documentType: document.getDocumentType() as DocumentType,
          side: document.getSide() as DocumentSide,
          documentUrl: docUrl,
          documentStatus: document.getDocumentStatus() as DocumentStatus,
        };
      }),
    );

    const kycResponseDto: IKycResponseDto = {
      id: kyc.getId(),
      userId: kyc.getUserId(),
      status: kyc.getStatus(),
      for: kyc.getFor(),
      documents: documents,
    };

    const kycStatusOutput: IGetKycStatusOutput = {
      kyc: kycResponseDto,
      status: kyc.getStatus(),
    };
    return Result.ok(kycStatusOutput);
  }
}
