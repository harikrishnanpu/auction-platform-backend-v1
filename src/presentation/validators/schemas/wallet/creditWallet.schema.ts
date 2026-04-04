import z from 'zod';

export const creditWalletSchema = z.object({
    amount: z.coerce
        .number()
        .positive()
        .min(1, 'Amount must be greater than 0'),
});

export type ZodCreditWalletInputType = z.infer<typeof creditWalletSchema>;
