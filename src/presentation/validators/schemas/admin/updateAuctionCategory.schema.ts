import z from 'zod';

export const UpdateAuctionCategorySchema = z.object({
    categoryId: z.string().trim().min(1, 'Category ID is required'),
    name: z.string().trim().min(1, 'Name is required'),
    parentId: z
        .string()
        .nullish()
        .transform((v) => (v == null || v === '' ? undefined : v)),
});

export type ZodUpdateAuctionCategoryInputType = z.infer<
    typeof UpdateAuctionCategorySchema
>;
