import { z } from 'zod';

export const placeBidSocketSchema = z.object({
  auctionId: z.string().trim().min(1, 'auctionId is required'),
  amount: z
    .number({ message: 'amount must be a number' })
    .positive('amount must be positive'),
});

export type PlaceBidSocketPayload = z.infer<typeof placeBidSocketSchema>;
