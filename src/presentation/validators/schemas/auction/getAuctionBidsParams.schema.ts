import { z } from 'zod';

export const getAuctionBidsParamsSchema = z.object({
    id: z.string().uuid('Invalid auction id'),
    userId: z.string().uuid('Invalid user id'),
});

export type ZodGetAuctionBidsParamsInputType = z.infer<
    typeof getAuctionBidsParamsSchema
>;
