import {
    DocumentSide,
    DocumentStatus,
    DocumentType,
    KycDocument,
} from '@domain/entities/kyc/kyc-document.entity';
import { IDbMapper } from '@domain/mappers/IDbMapper';
import { Result } from '@domain/shared/result';
import { KycDocument as PrismaKycDocument } from '@prisma/client';

export class KycDocumentMapper implements IDbMapper<
    KycDocument,
    PrismaKycDocument
> {
    toDomain(document: PrismaKycDocument): Result<KycDocument> {
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

    toPersistence(document: KycDocument): unknown {
        return {
            id: document.getId(),
            kycId: document.getKycId(),
            documentId: document.getDocumentId(),
            documentType: document.getDocumentType() as DocumentType,
            side: document.getSide() as DocumentSide,
            documentUrl: document.getDocumentUrl(),
            status: document.getDocumentStatus() as DocumentStatus,
        };
    }
}
