import { z } from 'zod';

const auctionTypeEnum = z.enum(['LONG', 'LIVE', 'SEALED', 'ALL']);

export const getBrowseAuctionsSchema = z.object({
    userId: z.string().trim().min(1, 'User ID is required'),
    auctionType: auctionTypeEnum.optional().default('ALL'),
    categoryId: z.string().optional().default('ALL'),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(50).optional().default(10),
    sort: z
        .enum(['startAt', 'endAt', 'startPrice', 'createdAt'])
        .optional()
        .default('startAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
    search: z.string().optional().default(''),
    scope: z.enum(['default', 'ending_soon']).optional().default('default'),
});

export type ZodGetBrowseAuctionsInputType = z.infer<
    typeof getBrowseAuctionsSchema
>;
