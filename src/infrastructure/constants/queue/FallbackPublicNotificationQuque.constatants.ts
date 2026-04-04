export const FALLBACK_PUBLIC_NOTIFICATION_QUEUE_CONSTANTS = {
    FALLBACK_PUBLIC_NOTIFICATION_QUEUE: 'fallback-public-notification-queue',
    FALLBACK_PUBLIC_NOTIFICATION_JOB_NAME:
        'process-fallback-public-notification',
    QUEUE_RETRY_TYPE: 'exponential' as const,
    QUEUE_RETRY_DELAY: 3000,
    QUEUE_RETRY_ATTEMPTS: 3,
    QUEUE_REMOVE_ON_COMPLETE: true,
    QUEUE_REMOVE_ON_FAIL: false,
} as const;
