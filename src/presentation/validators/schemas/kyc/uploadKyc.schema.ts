import { KycFor } from '@domain/entities/kyc/kyc.entity';
import z from 'zod';

export const uploadKycUrlSchema = z.object({
  kycFor: z.enum([KycFor.SELLER, KycFor.MODERATOR]),
  fileName: z.string().min(1, 'File name is required').trim(),
  contentType: z.string().min(1, 'Content type is required').trim(),
  fileSize: z.number().min(1, 'File size is required'),
});
