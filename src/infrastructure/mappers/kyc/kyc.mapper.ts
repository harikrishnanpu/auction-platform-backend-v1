import {
  DocumentSide,
  DocumentStatus,
  DocumentType,
  KycDocument,
} from '@domain/entities/kyc/kyc-document.entity';
import { Kyc, KycFor, KycStatus } from '@domain/entities/kyc/kyc.entity';
import { Result } from '@domain/shared/result';
import {
  Kyc as PrismaKyc,
  KycDocument as PrismaKycDocument,
} from '@prisma/client';

export type PrismaKycWithDocuments = PrismaKyc & {
  documents: PrismaKycDocument[];
};

export class KycMapper {
  static toDomain(kyc: PrismaKycWithDocuments): Result<Kyc> {
    const documents = kyc.documents.map((document) =>
      KycDocument.create({
        id: document.id,
        kycId: document.kycId,
        documentId: document.documentId,
        documentType: document.documentType as DocumentType,
        side: document.side as DocumentSide,
        documentUrl: document.documentUrl,
        documentStatus: document.status as DocumentStatus,
      }).getValue(),
    );

    return Result.ok(
      new Kyc(
        kyc.id,
        kyc.userId,
        kyc.status as KycStatus,
        kyc.for as KycFor,
        documents,
      ),
    );
  }

  static toPersistence(kyc: Kyc) {
    return {
      id: kyc.getId(),
      userId: kyc.getUserId(),
      status: kyc.getStatus(),
      for: kyc.getFor(),
    };
  }
}
