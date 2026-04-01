export const WINNER_FALLBACK_QUEUE_CONSTANTS = {
    WINNER_FALLBACK_QUEUE: 'auction-winner-fallback-queue',
    WINNER_FALLBACK_JOB_NAME: 'process-auction-winner-fallback',
    QUEUE_RETRY_TYPE: 'exponential' as const,
    QUEUE_RETRY_DELAY: 3000,
    QUEUE_RETRY_ATTEMPTS: 3,
    QUEUE_REMOVE_ON_COMPLETE: true,
    QUEUE_REMOVE_ON_FAIL: false,
} as const;
