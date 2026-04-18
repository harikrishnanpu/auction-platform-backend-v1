import { KycDocument } from '@domain/entities/kyc/kyc-document.entity';
import { Result } from '@domain/shared/result';

export interface IKycDocumentRepository {
    save(kycDocument: KycDocument): Promise<Result<void>>;
    findById(id: string): Promise<Result<KycDocument | null>>;
}
