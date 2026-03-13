import z from 'zod';

export const getAdminSellerSchema = z.object({
  id: z.string().trim().min(1, 'Seller ID is required'),
});
