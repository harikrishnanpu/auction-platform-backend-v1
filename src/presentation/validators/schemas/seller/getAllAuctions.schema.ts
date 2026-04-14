import z from 'zod';

export const getAllAuctionsSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    status: z.string().optional(),
    auctionType: z.string().optional(),
    categoryId: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
    sort: z.enum(['startAt', 'endAt', 'startPrice', 'createdAt']).optional(),
    order: z.enum(['asc', 'desc']).optional(),
    search: z.string().optional(),
});

export type ZodGetAllAuctionsInputType = z.infer<typeof getAllAuctionsSchema>;
