import {
    IAuctionWinnerFallbackQueue,
    IAuctionWinnerFallbackJobPayload,
} from '@application/interfaces/queue/IWinnerFallbackQueue';
import { redisConfig } from '@config/redis.config';
import { WINNER_FALLBACK_QUEUE_CONSTANTS } from '@infrastructure/constants/queue/winnerFallback.queue.constants';
import { Queue } from 'bullmq';
import { injectable } from 'inversify';

@injectable()
export class AuctionWinnerFallbackQueue implements IAuctionWinnerFallbackQueue {
    private readonly _queue: Queue;

    constructor() {
        this._queue = new Queue(
            WINNER_FALLBACK_QUEUE_CONSTANTS.WINNER_FALLBACK_QUEUE,
            {
                connection: redisConfig,
            },
        );
    }

    async enqueue(payload: IAuctionWinnerFallbackJobPayload): Promise<void> {
        const jobId = `winner-fallback:${payload.auctionId}:${payload.declinedUserId}:${payload.paymentId}`;

        await this._queue.add(
            WINNER_FALLBACK_QUEUE_CONSTANTS.WINNER_FALLBACK_JOB_NAME,
            payload,
            {
                jobId,
                removeOnComplete:
                    WINNER_FALLBACK_QUEUE_CONSTANTS.QUEUE_REMOVE_ON_COMPLETE,
                removeOnFail:
                    WINNER_FALLBACK_QUEUE_CONSTANTS.QUEUE_REMOVE_ON_FAIL,
                attempts: WINNER_FALLBACK_QUEUE_CONSTANTS.QUEUE_RETRY_ATTEMPTS,
                backoff: {
                    type: WINNER_FALLBACK_QUEUE_CONSTANTS.QUEUE_RETRY_TYPE,
                    delay: WINNER_FALLBACK_QUEUE_CONSTANTS.QUEUE_RETRY_DELAY,
                },
            },
        );
    }
}
