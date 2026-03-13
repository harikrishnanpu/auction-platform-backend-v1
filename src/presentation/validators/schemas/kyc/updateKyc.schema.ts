import {
  DocumentSide,
  DocumentType,
} from '@domain/entities/kyc/kyc-document.entity';
import { KycFor } from '@domain/entities/kyc/kyc.entity';
import z from 'zod';

export const updateKycSchema = z.object({
  documentType: z.nativeEnum(DocumentType),
  side: z.nativeEnum(DocumentSide),
  kycFor: z.nativeEnum(KycFor),
  fileKey: z.string().trim().min(1, 'File key is required'),
});
