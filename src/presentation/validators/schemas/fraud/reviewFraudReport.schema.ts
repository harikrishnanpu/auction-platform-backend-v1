import z from 'zod';

export const reviewFraudReportSchema = z.object({
    reportId: z.string().trim().min(1),
    decision: z.enum(['NO_ACTION', 'FAULT_VERIFIED']),
    note: z.string().trim().optional(),
});

export type ZodReviewFraudReportInputType = z.infer<
    typeof reviewFraudReportSchema
>;
