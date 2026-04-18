import z from 'zod';

export const verifyPaymentSchema = z.object({
    userId: z.string().trim().min(1, 'User ID is required'),
    paymentId: z.string().trim().min(1, 'Payment ID is required'),
    orderId: z.string().trim().min(1, 'Order ID is required'),
    gatewayPaymentId: z
        .string()
        .trim()
        .min(1, 'Gateway Payment ID is required'),
    signature: z.string().trim().min(1, 'Signature is required'),
});

export type ZodVerifyPaymentInputType = z.infer<typeof verifyPaymentSchema>;
