import z from 'zod';

export const getSellerAuctionPaymentsSchema = z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z
        .enum(['ALL', 'PENDING', 'COMPLETED', 'FAILED', 'DECLINED'])
        .optional(),
});

export type ZodGetSellerAuctionPaymentsInputType = z.infer<
    typeof getSellerAuctionPaymentsSchema
>;
