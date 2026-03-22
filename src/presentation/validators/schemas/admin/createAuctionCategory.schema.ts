import z from 'zod';

export const createAuctionCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Category name must be at least 3 characters long'),
  parentId: z.string().optional().nullable(),
});

export type ZodCreateAuctionCategoryInputType = z.infer<
  typeof createAuctionCategorySchema
>;
