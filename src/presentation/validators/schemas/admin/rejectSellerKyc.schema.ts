import z from 'zod';

export const rejectSellerKycSchema = z.object({
  id: z.string().trim().min(1, 'Seller ID is required'),
  reason: z.string().min(1, 'Reason is required'),
});

export type ZodRejectSellerKycInputType = z.infer<typeof rejectSellerKycSchema>;
