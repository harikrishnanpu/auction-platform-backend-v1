import { z } from 'zod';

export const auctionControlSocketSchema = z.object({
  auctionId: z.string().trim().min(1, 'auctionId is required'),
});

export type AuctionControlSocketPayload = z.infer<
  typeof auctionControlSocketSchema
>;
