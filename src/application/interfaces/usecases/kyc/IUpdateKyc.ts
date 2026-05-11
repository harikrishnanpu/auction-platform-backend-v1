import { IUpdateKycOutput } from '@application/dtos/kyc/update-kyc.dto';
import {
    DocumentSide,
    DocumentType,
} from '@domain/entities/kyc/kyc-document.entity';
import { KycFor } from '@domain/entities/kyc/kyc.entity';
import { Result } from '@domain/shared/result';

export interface IValidatedUpdateKycInput {
    userId: string;
    documentType: DocumentType;
    side: DocumentSide;
    kycFor: KycFor;
    fileKey: string;
}

export interface IUpdateKycUsecase {
    execute(data: IValidatedUpdateKycInput): Promise<Result<IUpdateKycOutput>>;
}
