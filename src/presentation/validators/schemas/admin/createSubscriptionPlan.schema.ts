import z from 'zod';

export const createSubscriptionPlanSchema = z.object({
    name: z.string().trim().min(1, 'Name is required'),
    description: z.string().trim().min(1, 'Description is required'),
    price: z.number().min(0, 'Price cannot be negative'),
    durationDays: z
        .number()
        .int()
        .positive('Duration days must be greater than 0'),
    isDefault: z.boolean().default(false),
    features: z
        .array(
            z.object({
                featureId: z.uuid('Feature ID is required'),
                value: z.string().trim().min(1, 'Value is required'),
            }),
        )
        .min(1, 'At least one feature is required'),
});

export type ZodCreateSubscriptionPlanInputType = z.infer<
    typeof createSubscriptionPlanSchema
>;
