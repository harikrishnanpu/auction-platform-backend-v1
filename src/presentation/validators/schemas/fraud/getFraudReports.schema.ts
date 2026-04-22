import z from 'zod';

export const getFraudReportsSchema = z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
    search: z.string().optional().default(''),
    status: z.enum(['OPEN', 'UNDER_REVIEW', 'RESOLVED']).optional(),
    sort: z.enum(['createdAt', 'updatedAt']).optional().default('createdAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type ZodGetFraudReportsInputType = z.infer<typeof getFraudReportsSchema>;
