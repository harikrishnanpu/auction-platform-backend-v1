import z from 'zod';

export const rejectAuctionCategorySchema = z.object({
  categoryId: z.string().trim().min(1, 'Category ID is required'),
  reason: z.string().min(1, 'Reason is required'),
});
