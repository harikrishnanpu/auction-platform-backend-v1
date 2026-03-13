import { IKycDocumentResponseDto } from '@application/dtos/kyc/kyc.response.dto';
import {
  IUpdateKycInput,
  IUpdateKycOutput,
} from '@application/dtos/kyc/update-kyc.dto';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { IUpdateKycUsecase } from '@application/interfaces/usecases/kyc/IUpdateKyc';
import { TYPES } from '@di/types.di';
import {
  DocumentStatus,
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

        const kycDocuments: IKycDocumentResponseDto[] = newKyc
          .getValue()
          .getDocuments()
          .map((document) => {
            return {
              id: document.getId(),
              kycId: document.getKycId(),
              documentType: document.getDocumentType(),
              side: document.getSide(),
              documentUrl: document.getDocumentUrl(),
              documentStatus: document.getDocumentStatus(),
            };
          });

        const kycUpdateReponse: IUpdateKycOutput = {
          kyc: {
            id: newKyc.getValue().getId(),
            userId: newKyc.getValue().getUserId(),
            status: newKyc.getValue().getStatus(),
            for: newKyc.getValue().getFor(),
            documents: kycDocuments,
          },
          status: newKyc.getValue().getStatus(),
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

      const kycDocuments: IKycDocumentResponseDto[] = kyc
        .getDocuments()
        .map((document) => {
          return {
            id: document.getId(),
            kycId: document.getKycId(),
            documentType: document.getDocumentType(),
            side: document.getSide(),
            documentUrl: document.getDocumentUrl(),
            documentStatus: document.getDocumentStatus(),
          };
        });

      const kycUpdateReponse: IUpdateKycOutput = {
        kyc: {
          id: kyc.getId(),
          userId: kyc.getUserId(),
          status: kyc.getStatus(),
          for: kyc.getFor(),
          documents: kycDocuments,
        },
        status: kyc.getStatus(),
      };

      return Result.ok(kycUpdateReponse);
    } catch (err: unknown) {
      console.log(err);
      return Result.fail('UNEXPECTED ERROR FROM UPDATE KYC USECASE');
    }
  }
}
