import z from 'zod';

export const approveAuctionCategorySchema = z.object({
  categoryId: z.string().trim().min(1, 'Category ID is required'),
});

export type ZodApproveAuctionCategoryInputType = z.infer<
  typeof approveAuctionCategorySchema
>;
