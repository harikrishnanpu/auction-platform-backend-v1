import z from 'zod';

export const rejectSellerKycSchema = z.object({
  reason: z.string().optional(),
});
