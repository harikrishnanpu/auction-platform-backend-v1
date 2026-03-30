import z from 'zod';

export const debitWalletSchema = z.object({
    amount: z.coerce
        .number()
        .positive()
        .min(1, 'Amount must be greater than 0'),
});

export type ZodDebitWalletInputType = z.infer<typeof debitWalletSchema>;
