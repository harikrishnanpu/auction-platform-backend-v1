import z from 'zod';

export const verifyWalletTopupSchema = z.object({
    orderId: z.string().trim().min(1, 'Order ID is required'),
    paymentId: z.string().trim().min(1, 'Payment ID is required'),
    signature: z.string().trim().min(1, 'Signature is required'),
});

export type ZodVerifyWalletTopupInputType = z.infer<
    typeof verifyWalletTopupSchema
>;
