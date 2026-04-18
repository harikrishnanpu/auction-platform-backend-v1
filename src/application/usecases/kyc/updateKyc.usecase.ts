import { IUpdateKycOutput } from '@application/dtos/kyc/update-kyc.dto';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { IStorageService } from '@application/interfaces/services/IStorageService';
import { IUpdateKycUsecase } from '@application/interfaces/usecases/kyc/IUpdateKyc';
import { KycMapperProfile } from '@application/mappers/kyc/kyc.mapper';
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
import { ZodUpdateKycInputType } from '@presentation/validators/schemas/kyc/updateKyc.schema';
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

    async execute(
        data: ZodUpdateKycInputType,
    ): Promise<Result<IUpdateKycOutput>> {
        try {
            const dto = KycMapperProfile.toUpdateKycInput(data);

            const kycEntity = await this._kycRepository.findByUserIdAndFor(
                dto.userId,
                dto.kycFor,
            );

            if (kycEntity.isFailure) {
                return Result.fail('error with the kyc entity');
            }

            const kyc = kycEntity.getValue();

            if (!kyc) {
                const newKyc = Kyc.create({
                    id: this._idGeneratingService.generateId(),
                    userId: dto.userId,
                    kycStatus: KycStatus.NOT_SUBMITTED,
                    kycFor: dto.kycFor,
                });

                if (newKyc.isFailure) {
                    return Result.fail('error with the new kyc entity');
                }

                const documentEntity = KycDocument.create({
                    id: this._idGeneratingService.generateId(),
                    kycId: newKyc.getValue().getId(),
                    documentId: this._idGeneratingService.generateId(),
                    documentType: dto.documentType,
                    side: dto.side,
                    documentUrl: dto.documentUrl,
                    documentStatus: DocumentStatus.PENDING,
                });

                if (documentEntity.isFailure) {
                    return Result.fail('error with the document entity');
                }

                await this._kycRepository.save(newKyc.getValue());

                await this._kycDocumentRepository.save(
                    documentEntity.getValue(),
                );

                const updatedKycEntity =
                    await this._kycRepository.findByUserIdAndFor(
                        dto.userId,
                        dto.kycFor,
                    );

                const updatedKyc = updatedKycEntity.getValue();

                if (updatedKycEntity.isFailure || !updatedKyc) {
                    return Result.fail('error with the updated kyc entity');
                }

                const kycDocuments = await Promise.all(
                    updatedKyc.getDocuments().map(async (document) => {
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
                            documentType:
                                document.getDocumentType() as DocumentType,
                            side: document.getSide() as DocumentSide,
                            documentUrl: docUrl,
                            documentStatus:
                                document.getDocumentStatus() as DocumentStatus,
                        };
                    }),
                );

                const kycUpdateResponse: IUpdateKycOutput = {
                    kyc: {
                        id: updatedKyc.getId(),
                        userId: updatedKyc.getUserId(),
                        status: updatedKyc.getStatus(),
                        for: updatedKyc.getFor(),
                        documents: kycDocuments,
                    },
                    status: updatedKyc.getStatus(),
                };

                return Result.ok(kycUpdateResponse);
            }

            if (kyc.getStatus() === KycStatus.REJECTED) {
                const reset = kyc.resetForResubmission();
                if (reset.isFailure) {
                    return Result.fail(reset.getError());
                }
                await this._kycRepository.save(kyc);
            }

            const documentEntity = KycDocument.create({
                id: this._idGeneratingService.generateId(),
                kycId: kyc.getId(),
                documentId: this._idGeneratingService.generateId(),
                documentType: dto.documentType,
                side: dto.side,
                documentUrl: dto.documentUrl,
                documentStatus: DocumentStatus.PENDING,
            });

            if (documentEntity.isFailure) {
                return Result.fail('error with the document entity');
            }

            await this._kycDocumentRepository.save(documentEntity.getValue());

            const updatedKycEntity =
                await this._kycRepository.findByUserIdAndFor(
                    dto.userId,
                    dto.kycFor,
                );

            const updatedKyc = updatedKycEntity.getValue();

            if (updatedKycEntity.isFailure || !updatedKyc) {
                return Result.fail('error with the updated kyc entity');
            }

            const kycDocuments = await Promise.all(
                updatedKyc.getDocuments().map(async (document) => {
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
                        documentType:
                            document.getDocumentType() as DocumentType,
                        side: document.getSide() as DocumentSide,
                        documentUrl: docUrl,
                        documentStatus:
                            document.getDocumentStatus() as DocumentStatus,
                    };
                }),
            );

            const kycUpdateResponse: IUpdateKycOutput = {
                kyc: {
                    id: updatedKyc.getId(),
                    userId: updatedKyc.getUserId(),
                    status: updatedKyc.getStatus(),
                    for: updatedKyc.getFor(),
                    documents: kycDocuments,
                },
                status: updatedKyc.getStatus(),
            };

            return Result.ok(kycUpdateResponse);
        } catch (err: unknown) {
            console.log(err);
            return Result.fail('UNEXPECTED ERROR FROM UPDATE KYC USECASE');
        }
    }
}
