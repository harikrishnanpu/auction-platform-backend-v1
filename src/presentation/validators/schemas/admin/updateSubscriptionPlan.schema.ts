import z from 'zod';

export const updateSubscriptionPlanSchema = z.object({
    planId: z.string().trim().min(1, 'Plan id is required'),
    name: z.string().trim().min(1, 'Name is required'),
    description: z.string().trim().min(1, 'Description is required'),
    price: z.number().min(0, 'Price cannot be negative'),
    durationDays: z
        .number()
        .int()
        .positive('Duration days must be greater than 0'),
    isDefault: z.boolean(),
    isActive: z.boolean(),
    features: z
        .array(
            z.object({
                featureId: z.uuid('Feature ID is required'),
                value: z.string().trim().min(1, 'Value is required'),
            }),
        )
        .min(1, 'At least one feature is required'),
});

export type ZodUpdateSubscriptionPlanInputType = z.infer<
    typeof updateSubscriptionPlanSchema
>;
