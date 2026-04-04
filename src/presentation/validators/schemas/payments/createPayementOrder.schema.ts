import z from 'zod';

export const createPaymentOrderSchema = z.object({
    paymentId: z.string().trim().min(1, 'Payment ID is required'),
});

export type ZodCreatePaymentOrderInputType = z.infer<
    typeof createPaymentOrderSchema
>;
