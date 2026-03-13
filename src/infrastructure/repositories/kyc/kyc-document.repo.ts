import { TYPES } from '@di/types.di';
import { KycDocument } from '@domain/entities/kyc/kyc-document.entity';
import { IKycDocumentRepository } from '@domain/repositories/IKycDocumentRepository';
import { DocumentStatus, DocumentType, PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';

@injectable()
export class PrismaKycDocumentRepo implements IKycDocumentRepository {
  constructor(
    @inject(TYPES.PrismaClient)
    private readonly _prisma: PrismaClient,
  ) {}

  async save(kycDocument: KycDocument): Promise<void> {
    await this._prisma.kycDocument.upsert({
      where: {
        kycId_documentType_side: {
          kycId: kycDocument.getKycId(),
          documentType: kycDocument.getDocumentType() as DocumentType,
          side: kycDocument.getSide(),
        },
      },
      create: {
        id: kycDocument.getId(),
        documentId: kycDocument.getDocumentId(),
        documentType: kycDocument.getDocumentType() as DocumentType,
        side: kycDocument.getSide(),
        documentUrl: kycDocument.getDocumentUrl(),
        status: kycDocument.getDocumentStatus() as DocumentStatus,
        kyc: {
          connect: {
            id: kycDocument.getKycId(),
          },
        },
      },
      update: {
        documentType: kycDocument.getDocumentType() as DocumentType,
        side: kycDocument.getSide(),
        documentUrl: kycDocument.getDocumentUrl(),
        status: kycDocument.getDocumentStatus() as DocumentStatus,
        kyc: {
          connect: {
            id: kycDocument.getKycId(),
          },
        },
      },
    });
  }
}
