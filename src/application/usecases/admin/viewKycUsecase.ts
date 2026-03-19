import {
  IViewKycInputDto,
  IViewKycOutputDto,
} from '@application/dtos/admin/viewKyc.dto';
import { IStorageService } from '@application/interfaces/services/IStorageService';
import { IViewKycUsecase } from '@application/interfaces/usecases/admin/IViewKycUsecase';
import { TYPES } from '@di/types.di';
import { IKycDocumentRepository } from '@domain/repositories/IKycDocumentRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class ViewKycUsecase implements IViewKycUsecase {
  constructor(
    @inject(TYPES.IStorageService)
    private readonly _storageService: IStorageService,
    @inject(TYPES.IKycDocumentRepository)
    private readonly _kycDocumentRepository: IKycDocumentRepository,
  ) {}

  async execute(data: IViewKycInputDto): Promise<Result<IViewKycOutputDto>> {
    const documentEntity = await this._kycDocumentRepository.findById(
      data.documentId,
    );

    if (documentEntity.isFailure) {
      return Result.fail(documentEntity.getError());
    }

    const document = documentEntity.getValue();

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
