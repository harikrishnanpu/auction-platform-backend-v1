import z from 'zod';

export const declinePaymentSchema = z.object({
    paymentId: z.string().trim().min(1, 'Payment ID is required'),
});

export type ZodDeclinePaymentInputType = z.infer<typeof declinePaymentSchema>;
