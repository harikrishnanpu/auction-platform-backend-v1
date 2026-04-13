import {
    DocumentSide,
    DocumentStatus,
    DocumentType,
    KycDocument,
} from '@domain/entities/kyc/kyc-document.entity';
import { Kyc, KycFor, KycStatus } from '@domain/entities/kyc/kyc.entity';
import { IDbMapper } from '@domain/mappers/IDbMapper';
import { Result } from '@domain/shared/result';
import {
    Kyc as PrismaKyc,
    KycDocument as PrismaKycDocument,
} from '@prisma/client';

export type PrismaKycWithDocuments = PrismaKyc & {
    documents: PrismaKycDocument[];
};

export class KycMapper implements IDbMapper<Kyc, PrismaKycWithDocuments> {
    toDomain(kyc: PrismaKycWithDocuments): Result<Kyc> {
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

        const rejectionReason = kyc.rejectionReason ?? null;

        const kycEntity = Kyc.create({
            id: kyc.id,
            userId: kyc.userId,
            kycStatus: kyc.status as KycStatus,
            kycFor: kyc.for as KycFor,
            documents: documents,
            rejectionReason: rejectionReason,
        });

        if (kycEntity.isFailure) return Result.fail(kycEntity.getError());

        return Result.ok(kycEntity.getValue());
    }

    toPersistence(kyc: Kyc): unknown {
        return {
            id: kyc.getId(),
            userId: kyc.getUserId(),
            status: kyc.getStatus(),
            for: kyc.getFor(),
            rejectionReason: kyc.getRejectionReason(),
        };
    }
}
