export const AUCTION_END_QUEUE_CONSTANTS = {
    AUCTION_END_QUEUE: 'auction-end-queue',
    AUCTION_END_JOB_NAME: 'process-auction-end',
    QUEUE_RETRY_TYPE: 'exponential' as const,
    QUEUE_RETRY_DELAY: 3000,
    QUEUE_RETRY_ATTEMPTS: 3,
    QUEUE_REMOVE_ON_COMPLETE: true,
    QUEUE_REMOVE_ON_FAIL: false,
} as const;
