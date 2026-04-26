import z from 'zod';

export const createFraudReportSchema = z.object({
    targetedUserId: z.string().trim().min(1),
    reportedUserType: z.enum(['USER', 'SELLER']).optional(),
    category: z.enum(['AUCTION_FRAUD_CRITICAL', 'PAYMENT_CRITICAL', 'OTHER']),
    level: z.enum(['LOW', 'MEDIUM', 'CRITICAL']),
    reason: z.string().trim().min(3),
});

export type ZodCreateFraudReportInputType = z.infer<
    typeof createFraudReportSchema
>;
