import {
  DocumentSide,
  DocumentStatus,
  DocumentType,
  KycDocument,
} from '@domain/entities/kyc/kyc-document.entity';
import { Result } from '@domain/shared/result';
import { KycDocument as PrismaKycDocument } from '@prisma/client';

export class KycDocumentMapper {
  static toDomain(document: PrismaKycDocument): Result<KycDocument> {
    return KycDocument.create({
      id: document.id,
      kycId: document.kycId,
      documentId: document.documentId,
      documentType: document.documentType as DocumentType,
      side: document.side as DocumentSide,
      documentUrl: document.documentUrl,
      documentStatus: document.status as DocumentStatus,
    });
  }
}
