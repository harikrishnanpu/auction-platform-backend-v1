import { userResponseDto } from '../user/userResponse.dto';
import { KycFor, KycStatus } from '@domain/entities/kyc/kyc.entity';
import {
  DocumentSide,
  DocumentStatus,
  DocumentType,
} from '@domain/entities/kyc/kyc-document.entity';

export interface IGetAdminSellerInput {
  sellerId: string;
}

export interface IKycDocumentDto {
  id: string;
  kycId: string;
  documentType: DocumentType;
  side: DocumentSide;
  documentUrl: string;
  documentStatus: DocumentStatus;
}

export interface IKycProfileDto {
  id: string;
  userId: string;
  status: KycStatus;
  for: KycFor;
  rejectionReason?: string;
  documents: IKycDocumentDto[];
}

export interface IAdminSellerDetailDto extends userResponseDto {
  kyc?: IKycProfileDto;
  kycStatus?: KycStatus;
}

export interface IGetAdminSellerOutput {
  seller: IAdminSellerDetailDto;
}
