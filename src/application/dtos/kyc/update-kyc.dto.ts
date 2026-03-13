import { KycFor, KycStatus } from '@domain/entities/kyc/kyc.entity';
import { IKycResponseDto } from './kyc.response.dto';
import {
  DocumentSide,
  DocumentType,
} from '@domain/entities/kyc/kyc-document.entity';

export interface IUpdateKycInput {
  userId: string;
  kycFor: KycFor;
  documentType: DocumentType;
  documentUrl: string;
  side: DocumentSide;
}

export interface IUpdateKycOutput {
  kyc: IKycResponseDto;
  status: KycStatus;
}
