import { KycFor } from '@domain/entities/kyc/kyc.entity';
import z from 'zod';

export const submitKycSchema = z.object({
    kycFor: z.enum([KycFor.SELLER, KycFor.MODERATOR]),
    userId: z.string().trim().min(1, 'User ID is required'),
});

export type ZodSubmitKycInputType = z.infer<typeof submitKycSchema>;
