import z from 'zod';

export const updateFraudReportSchema = z.object({
    reportId: z.string().trim().min(1),
    category: z
        .enum(['AUCTION_FRAUD_CRITICAL', 'PAYMENT_CRITICAL', 'OTHER'])
        .optional(),
    status: z.enum(['OPEN', 'UNDER_REVIEW', 'RESOLVED']).optional(),
    decision: z.enum(['NO_ACTION', 'FAULT_VERIFIED']).nullable().optional(),
    reporterType: z.enum(['USER', 'SELLER', 'SYSTEM']).optional(),
    source: z.enum(['MANUAL', 'SYSTEM']).optional(),
    level: z.enum(['LOW', 'MEDIUM', 'CRITICAL']).optional(),
});

export type ZodUpdateFraudReportInputType = z.infer<
    typeof updateFraudReportSchema
>;
