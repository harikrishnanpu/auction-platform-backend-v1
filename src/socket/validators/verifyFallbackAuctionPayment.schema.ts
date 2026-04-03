import { z } from 'zod';

export const verifyFallbackAuctionPaymentSchema = z.object({
    orderId: z.string().trim().min(1, 'orderId is required'),
    signature: z.string().trim().min(1, 'signature is required'),
    auctionId: z.string().trim().min(1, 'auctionId is required'),
    gatewayPaymentId: z.string().trim().min(1, 'gatewayPaymentId is required'),
});

export type VerifyFallbackAuctionPaymentPayload = z.infer<
    typeof verifyFallbackAuctionPaymentSchema
>;
