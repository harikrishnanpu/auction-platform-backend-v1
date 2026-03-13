import {
  IUpdateKycInput,
  IUpdateKycOutput,
} from '@application/dtos/kyc/update-kyc.dto';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { IStorageService } from '@application/interfaces/services/IStorageService';
import { IUpdateKycUsecase } from '@application/interfaces/usecases/kyc/IUpdateKyc';
import { TYPES } from '@di/types.di';
import {
  DocumentSide,
  DocumentStatus,
  DocumentType,
  KycDocument,
} from '@domain/entities/kyc/kyc-document.entity';
import { Kyc, KycStatus } from '@domain/entities/kyc/kyc.entity';
import { IKycDocumentRepository } from '@domain/repositories/IKycDocumentRepository';
import { IKycRepository } from '@domain/repositories/IKycRespository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class UpdateKycUseCase implements IUpdateKycUsecase {
  constructor(
    @inject(TYPES.IKycRepository)
    private readonly _kycRepository: IKycRepository,
    @inject(TYPES.IIdGeneratingService)
    private readonly _idGeneratingService: IIdGeneratingService,
    @inject(TYPES.IKycDocumentRepository)
    private readonly _kycDocumentRepository: IKycDocumentRepository,
    @inject(TYPES.IStorageService)
    private readonly _storageService: IStorageService,
  ) {}

  async execute(data: IUpdateKycInput): Promise<Result<IUpdateKycOutput>> {
    try {
      const kycEntity = await this._kycRepository.findByUserIdAndFor(
        data.userId,
        data.kycFor,
      );

      if (kycEntity.isFailure) {
        return Result.fail('error with the kyc entity');
      }

      const kyc = kycEntity.getValue();

      if (!kyc) {
        const newKyc = Kyc.create({
          id: this._idGeneratingService.generateId(),
          userId: data.userId,
          kycStatus: KycStatus.NOT_SUBMITTED,
          kycFor: data.kycFor,
        });

        if (newKyc.isFailure) {
          return Result.fail('error with the new kyc entity');
        }

        const documentEntity = KycDocument.create({
          id: this._idGeneratingService.generateId(),
          kycId: newKyc.getValue().getId(),
          documentId: this._idGeneratingService.generateId(),
          documentType: data.documentType,
          side: data.side,
          documentUrl: data.documentUrl,
          documentStatus: DocumentStatus.PENDING,
        });

        if (documentEntity.isFailure) {
          return Result.fail('error with the document entity');
        }

        await this._kycRepository.save(newKyc.getValue());

        await this._kycDocumentRepository.save(documentEntity.getValue());

        const updatedKyc = await this._kycRepository.findByUserIdAndFor(
          data.userId,
          data.kycFor,
        );

        if (updatedKyc.isFailure) {
          return Result.fail('error with the updated kyc entity');
        }

        const kycDocuments = await Promise.all(
          updatedKyc
            .getValue()
            .getDocuments()
            .map(async (document) => {
              let docUrl = '';
              const docUrlResult =
                await this._storageService.generateDownloadUrl({
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

        const kycUpdateReponse: IUpdateKycOutput = {
          kyc: {
            id: updatedKyc.getValue().getId(),
            userId: updatedKyc.getValue().getUserId(),
            status: updatedKyc.getValue().getStatus(),
            for: updatedKyc.getValue().getFor(),
            documents: kycDocuments,
          },
          status: updatedKyc.getValue().getStatus(),
        };

        return Result.ok(kycUpdateReponse);
      }

      const documentEntity = KycDocument.create({
        id: this._idGeneratingService.generateId(),
        kycId: kyc.getId(),
        documentId: this._idGeneratingService.generateId(),
        documentType: data.documentType,
        side: data.side,
        documentUrl: data.documentUrl,
        documentStatus: DocumentStatus.PENDING,
      });

      if (documentEntity.isFailure) {
        return Result.fail('error with the document entity');
      }

      if (documentEntity.isFailure) {
        return Result.fail('error with the document entity');
      }

      await this._kycDocumentRepository.save(documentEntity.getValue());

      const updatedKyc = await this._kycRepository.findByUserIdAndFor(
        data.userId,
        data.kycFor,
      );

      if (updatedKyc.isFailure) {
        return Result.fail('error with the updated kyc entity');
      }

      const kycDocuments = await Promise.all(
        updatedKyc
          .getValue()
          .getDocuments()
          .map(async (document) => {
            let docUrl = '';
            const docUrlResult = await this._storageService.generateDownloadUrl(
              { fileKey: document.getDocumentUrl() },
            );
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

      const kycUpdateReponse: IUpdateKycOutput = {
        kyc: {
          id: updatedKyc.getValue().getId(),
          userId: updatedKyc.getValue().getUserId(),
          status: updatedKyc.getValue().getStatus(),
          for: updatedKyc.getValue().getFor(),
          documents: kycDocuments,
        },
        status: updatedKyc.getValue().getStatus(),
      };

      return Result.ok(kycUpdateReponse);
    } catch (err: unknown) {
      console.log(err);
      return Result.fail('UNEXPECTED ERROR FROM UPDATE KYC USECASE');
    }
  }
}
