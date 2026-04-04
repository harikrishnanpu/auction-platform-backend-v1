import z from 'zod';

export const createWalletTopupSchema = z.object({
    amount: z.coerce
        .number()
        .positive()
        .min(1, 'Amount must be greater than 0'),
});

export type ZodCreateWalletTopupInputType = z.infer<
    typeof createWalletTopupSchema
>;
