import { KycDocument } from '@domain/entities/kyc/kyc-document.entity';

export interface IKycDocumentRepository {
  save(kycDocument: KycDocument): Promise<void>;
}
