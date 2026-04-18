import { z } from 'zod';

export const publishAuctionParamsSchema = z.object({
    id: z.string().min(1, 'Auction id is required').trim(),
    userId: z.string().trim().min(1, 'User ID is required'),
});

export type ZodPublishAuctionParamsInputType = z.infer<
    typeof publishAuctionParamsSchema
>;
