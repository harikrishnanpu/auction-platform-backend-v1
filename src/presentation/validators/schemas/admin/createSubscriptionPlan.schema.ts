import {
    SubscriptionFeatureKey,
    SubscriptionFeatureValueType,
} from '@domain/constants/subscriptionFeature.constants';
import z from 'zod';

export const createSubscriptionPlanSchema = z.object({
    name: z.string().trim().min(1, 'Name is required'),
    description: z.string().trim().min(1, 'Description is required'),
    price: z.number().positive('Price must be greater than 0'),
    durationDays: z
        .number()
        .int()
        .positive('Duration days must be greater than 0'),
    features: z
        .array(
            z.object({
                featureKey: z.enum(SubscriptionFeatureKey, {
                    error: 'Invalid subscription feature key',
                }),
                value: z.string().trim().min(1, 'Feature value is required'),
                type: z.enum(SubscriptionFeatureValueType, {
                    error: 'Invalid subscription feature type',
                }),
            }),
        )
        .min(1, 'At least one feature is required'),
});

export type ZodCreateSubscriptionPlanInputType = z.infer<
    typeof createSubscriptionPlanSchema
>;
