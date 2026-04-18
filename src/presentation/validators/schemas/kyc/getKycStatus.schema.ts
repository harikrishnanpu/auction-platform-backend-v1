import { KycFor } from '@domain/entities/kyc/kyc.entity';
import z from 'zod';

export const getKycStatusSchema = z.object({
    userId: z.string().trim().min(1, 'User ID is required'),
    kycFor: z.enum([KycFor.SELLER, KycFor.MODERATOR]),
});

export type ZodGetKycStatusInputType = z.infer<typeof getKycStatusSchema>;
