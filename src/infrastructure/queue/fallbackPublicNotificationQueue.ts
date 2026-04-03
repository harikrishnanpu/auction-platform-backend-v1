import {
    IFallbackPublicNotificationQueue,
    IFallbackPublicNotificationQueuePayload,
} from '@application/interfaces/queue/IFallbackPublicNotificationQueue';
import { FALLBACK_PUBLIC_NOTIFICATION_QUEUE_CONSTANTS } from '@infrastructure/constants/queue/FallbackPublicNotificationQuque.constatants';
import { Queue } from 'bullmq';
import { redisConfig } from '@config/redis.config';

export class FallbackPublicNotificationQueue implements IFallbackPublicNotificationQueue {
    private readonly _queue: Queue;

    constructor() {
        this._queue = new Queue(
            FALLBACK_PUBLIC_NOTIFICATION_QUEUE_CONSTANTS.FALLBACK_PUBLIC_NOTIFICATION_QUEUE,
            {
                connection: redisConfig,
            },
        );
    }

    async enqueue(
        payload: IFallbackPublicNotificationQueuePayload,
    ): Promise<void> {
        await this._queue.add(
            FALLBACK_PUBLIC_NOTIFICATION_QUEUE_CONSTANTS.FALLBACK_PUBLIC_NOTIFICATION_JOB_NAME,
            payload,
            {
                removeOnComplete:
                    FALLBACK_PUBLIC_NOTIFICATION_QUEUE_CONSTANTS.QUEUE_REMOVE_ON_COMPLETE,
                removeOnFail:
                    FALLBACK_PUBLIC_NOTIFICATION_QUEUE_CONSTANTS.QUEUE_REMOVE_ON_FAIL,
                attempts:
                    FALLBACK_PUBLIC_NOTIFICATION_QUEUE_CONSTANTS.QUEUE_RETRY_ATTEMPTS,
                backoff: {
                    type: FALLBACK_PUBLIC_NOTIFICATION_QUEUE_CONSTANTS.QUEUE_RETRY_TYPE,
                    delay: FALLBACK_PUBLIC_NOTIFICATION_QUEUE_CONSTANTS.QUEUE_RETRY_DELAY,
                },
            },
        );
    }
}
