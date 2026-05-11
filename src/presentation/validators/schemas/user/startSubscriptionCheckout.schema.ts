import { z } from 'zod';

export const startSubscriptionCheckoutSchema = z.object({
    subscriptionPlanId: z.string().min(1),
});

export type ZodStartSubscriptionCheckoutInputType = z.infer<
    typeof startSubscriptionCheckoutSchema
>;
