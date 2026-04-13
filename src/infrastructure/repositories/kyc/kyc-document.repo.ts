import { TYPES } from '@di/types.di';
import { KycDocument } from '@domain/entities/kyc/kyc-document.entity';
import { IKycDocumentRepository } from '@domain/repositories/IKycDocumentRepository';
import { Result } from '@domain/shared/result';
import { DocumentStatus, DocumentType, PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { BaseRepository } from '../base/base.Repo';
import { KycDocument as PrismaKycDocument } from '@prisma/client';
import { IDbMapper } from '@domain/mappers/IDbMapper';

@injectable()
export class PrismaKycDocumentRepo
    extends BaseRepository<
        KycDocument,
        PrismaKycDocument,
        { id: string },
        IDbMapper<KycDocument, PrismaKycDocument>
    >
    implements IKycDocumentRepository
{
    constructor(
        @inject(TYPES.PrismaClient)
        private readonly _prisma: PrismaClient,
        @inject(TYPES.KycDocumentMapper)
        readonly mapper: IDbMapper<KycDocument, PrismaKycDocument>,
    ) {
        super(_prisma.kycDocument, mapper);
    }

    async save(kycDocument: KycDocument): Promise<Result<void>> {
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

        return Result.ok();
    }
}
