import { z } from 'zod';

export const verifyFallbackAuctionPaymentSchema = z.object({
    orderId: z.string().trim().min(1, 'orderId is required'),
    signature: z.string().trim().min(1, 'signature is required'),
    paymentId: z.string().trim().min(1, 'paymentId is required'),
});

export type VerifyFallbackAuctionPaymentPayload = z.infer<
    typeof verifyFallbackAuctionPaymentSchema
>;
