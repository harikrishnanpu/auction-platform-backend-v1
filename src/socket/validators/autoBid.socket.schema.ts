import { z } from 'zod';

export const autoBidSetSocketSchema = z.object({
    auctionId: z.string().trim().min(1, 'auctionId is required'),
    strategy: z.enum(['SLOW', 'FASTER', 'SNIPER']),
    maxBidAmount: z
        .number({ message: 'maxBidAmount must be a number' })
        .positive('maxBidAmount must be positive'),
});

export const autoBidDisableSocketSchema = z.object({
    auctionId: z.string().trim().min(1, 'auctionId is required'),
});

export type AutoBidSetSocketPayload = z.infer<typeof autoBidSetSocketSchema>;
export type AutoBidDisableSocketPayload = z.infer<
    typeof autoBidDisableSocketSchema
>;
