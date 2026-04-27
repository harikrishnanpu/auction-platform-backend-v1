export const SYSTEM_CONFIG_KEYS = {
    FRAUD_SUSPENSION_THRESHOLD: 'fraud.suspension_threshold',
    FRAUD_TEMPORARY_SUSPENSION_DURATION_MS:
        'fraud.temporary_suspension_duration_ms',
} as const;

export type SystemConfigKey =
    (typeof SYSTEM_CONFIG_KEYS)[keyof typeof SYSTEM_CONFIG_KEYS];

export const SYSTEM_CONFIG_KEY_ENUM = Object.values(SYSTEM_CONFIG_KEYS) as [
    SystemConfigKey,
    ...SystemConfigKey[],
];
