import { IViewKycOutputDto } from '@application/dtos/admin/viewKyc.dto';
import { IStorageService } from '@application/interfaces/services/IStorageService';
import { IViewKycUsecase } from '@application/interfaces/usecases/admin/IViewKycUsecase';
import { AdminMapperProfile } from '@application/mappers/admin/admin.mapper';
import { TYPES } from '@di/types.di';
import { IKycDocumentRepository } from '@domain/repositories/IKycDocumentRepository';
import { Result } from '@domain/shared/result';
import { ZodViewKycInputType } from '@presentation/validators/schemas/admin/viewKyc.schema';
import { inject, injectable } from 'inversify';

@injectable()
export class ViewKycUsecase implements IViewKycUsecase {
    constructor(
        @inject(TYPES.IStorageService)
        private readonly _storageService: IStorageService,
        @inject(TYPES.IKycDocumentRepository)
        private readonly _kycDocumentRepository: IKycDocumentRepository,
    ) {}

    async execute(
        data: ZodViewKycInputType,
    ): Promise<Result<IViewKycOutputDto>> {
        const dto = AdminMapperProfile.toViewKycInputDto(data);
        const { documentId } = dto;

        const documentEntity =
            await this._kycDocumentRepository.findById(documentId);

        if (documentEntity.isFailure) {
            return Result.fail(documentEntity.getError());
        }

        const document = documentEntity.getValue();

        if (!document) {
            return Result.fail('Document not found');
        }

        const filekEY = document.getDocumentUrl();

        const documentUrlResult = await this._storageService.streamFile({
            fileKey: filekEY,
        });

        if (documentUrlResult.isFailure) {
            return Result.fail(documentUrlResult.getError());
        }

        const response: IViewKycOutputDto = {
            stream: documentUrlResult.getValue().stream,
            contentType: documentUrlResult.getValue().contentType,
        };

        return Result.ok<IViewKycOutputDto>(response);
    }
}
