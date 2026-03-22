import { z } from 'zod';

export const publishAuctionParamsSchema = z.object({
  id: z.string().min(1, 'Auction id is required').trim(),
});

export type ZodPublishAuctionParamsInputType = z.infer<
  typeof publishAuctionParamsSchema
>;
