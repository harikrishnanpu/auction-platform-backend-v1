import { SubscriptionFeatureKey } from '@domain/constants/subscriptionFeature.constants';
import z from 'zod';

const baseCreateSubscriptionPlanSchema = z.object({
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
                featureKey: z.enum(SubscriptionFeatureKey),
                value: z.string().trim().min(1, 'Feature value is required'),
            }),
        )
        .min(1, 'At least one feature is required'),
});

export const createSubscriptionPlanSchema = baseCreateSubscriptionPlanSchema;

export type ZodCreateSubscriptionPlanInputType = z.infer<
    typeof createSubscriptionPlanSchema
>;
