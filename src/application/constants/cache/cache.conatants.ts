export const CACHE_CONSTANTS = {
    SUBSCRIPTION_PLAN_KEY: (planId: string) => `subscriptionPlan:${planId}`,
    SUBSCRIPTION_PLAN_TTL: 24 * 60 * 60,
};
