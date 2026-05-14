import { z } from 'zod';

export const getUserHomeAuctionFeedQuerySchema = z.object({
    liveLimit: z.coerce.number().int().min(1).max(24).optional().default(8),
    longSealedLimit: z.coerce
        .number()
        .int()
        .min(1)
        .max(24)
        .optional()
        .default(12),
});

export type ZodGetUserHomeAuctionFeedQueryType = z.infer<
    typeof getUserHomeAuctionFeedQuerySchema
>;
