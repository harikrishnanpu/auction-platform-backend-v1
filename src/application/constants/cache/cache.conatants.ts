export const CACHE_CONSTANTS = {
    SUBSCRIPTION_PLAN_KEY: (planId: string) => `subscriptionPlan:${planId}`,
    SUBSCRIPTION_PLAN_TTL: 24 * 60 * 60,

    SYSTEM_CONFIG_NUMERIC_KEY: (configKey: string) =>
        `systemConfig:numeric:${configKey}`,
    SYSTEM_CONFIG_NUMERIC_TTL_SECONDS: 5 * 60,
};
