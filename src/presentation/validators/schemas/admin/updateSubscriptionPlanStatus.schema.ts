import z from 'zod';

export const updateSubscriptionPlanStatusSchema = z.object({
    planId: z.string().trim().min(1, 'Plan id is required'),
    isDefault: z.boolean(),
    isActive: z.boolean(),
});

export type ZodUpdateSubscriptionPlanStatusInputType = z.infer<
    typeof updateSubscriptionPlanStatusSchema
>;
