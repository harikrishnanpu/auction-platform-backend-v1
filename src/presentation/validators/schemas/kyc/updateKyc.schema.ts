import {
    DocumentSide,
    DocumentType,
} from '@domain/entities/kyc/kyc-document.entity';
import { KycFor } from '@domain/entities/kyc/kyc.entity';
import z from 'zod';

export const updateKycSchema = z.object({
    userId: z.string().trim().min(1, 'User ID is required'),
    documentType: z.enum(DocumentType),
    side: z.enum(DocumentSide),
    kycFor: z.enum(KycFor),
    fileKey: z.string().trim().min(1, 'File key is required'),
});

export type ZodUpdateKycInputType = z.infer<typeof updateKycSchema>;
