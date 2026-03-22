import { KycFor } from '@domain/entities/kyc/kyc.entity';
import z from 'zod';

export const submitKycSchema = z.object({
  kycFor: z.enum([KycFor.SELLER, KycFor.MODERATOR]),
});

export type ZodSubmitKycInputType = z.infer<typeof submitKycSchema>;
