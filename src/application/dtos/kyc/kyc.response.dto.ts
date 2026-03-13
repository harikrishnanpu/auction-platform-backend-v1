import {
  DocumentSide,
  DocumentStatus,
  DocumentType,
} from '@domain/entities/kyc/kyc-document.entity';
import { KycFor, KycStatus } from '@domain/entities/kyc/kyc.entity';

export interface IKycDocumentResponseDto {
  id: string;
  kycId: string;
  documentType: DocumentType;
  side: DocumentSide;
  documentUrl: string;
  documentStatus: DocumentStatus;
}

export interface IKycResponseDto {
  id: string;
  userId: string;
  status: KycStatus;
  for: KycFor;
  rejectionReason?: string;
  documents: IKycDocumentResponseDto[];
}
