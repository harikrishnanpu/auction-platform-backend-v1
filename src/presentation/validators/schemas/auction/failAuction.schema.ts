import z from 'zod';

export const failAuctionSchema = z.object({
    auctionId: z.string().trim().min(1, 'Auction ID is required'),
    reason: z.string().trim().min(1, 'Reason is required'),
});

export type ZodFailAuctionInputType = z.infer<typeof failAuctionSchema>;
