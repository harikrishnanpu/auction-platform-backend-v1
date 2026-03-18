import z from 'zod';

export const changeAuctionCategoryStatusSchema = z.object({
  categoryId: z.string().trim().min(1, 'Category ID is required'),
  status: z.boolean(),
});
