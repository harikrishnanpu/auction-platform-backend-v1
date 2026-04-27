export enum SystemConfigKey {
    FRAUD_SUSPENSION_THRESHOLD = 'fraud.suspension_threshold',
    FRAUD_TEMPORARY_SUSPENSION_DURATION_MS = 'fraud.temporary_suspension_duration_ms',
}

export const DEFAULT_SYSTEM_CONFIGS: Array<{
    key: SystemConfigKey;
    value: string;
    description: string;
}> = [
    {
        key: SystemConfigKey.FRAUD_SUSPENSION_THRESHOLD,
        value: '3',
        description: 'Fraud points threshold to suspend a user',
    },
    {
        key: SystemConfigKey.FRAUD_TEMPORARY_SUSPENSION_DURATION_MS,
        value: String(7 * 24 * 60 * 60 * 1000),
        description: 'Temporary suspension duration in milliseconds',
    },
];
