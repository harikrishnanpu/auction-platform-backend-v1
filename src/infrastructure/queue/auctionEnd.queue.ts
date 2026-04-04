import {
    IAuctionEndQueue,
    IAuctionEndQueuePayload,
} from '@application/interfaces/queue/IAuctionEndQueue';
import { redisConfig } from '@config/redis.config';
import { AUCTION_END_QUEUE_CONSTANTS } from '@infrastructure/constants/queue/auctionEnd.queue.constants';
import { Queue } from 'bullmq';

export class AuctionEndQueue implements IAuctionEndQueue {
    private readonly _queue: Queue;

    constructor() {
        this._queue = new Queue(AUCTION_END_QUEUE_CONSTANTS.AUCTION_END_QUEUE, {
            connection: redisConfig,
        });
    }

    async enqueue(payload: IAuctionEndQueuePayload): Promise<void> {
        await this._queue.add(
            AUCTION_END_QUEUE_CONSTANTS.AUCTION_END_JOB_NAME,
            payload,
            {
                removeOnComplete:
                    AUCTION_END_QUEUE_CONSTANTS.QUEUE_REMOVE_ON_COMPLETE,
                removeOnFail: AUCTION_END_QUEUE_CONSTANTS.QUEUE_REMOVE_ON_FAIL,
                attempts: AUCTION_END_QUEUE_CONSTANTS.QUEUE_RETRY_ATTEMPTS,
                backoff: {
                    type: AUCTION_END_QUEUE_CONSTANTS.QUEUE_RETRY_TYPE,
                    delay: AUCTION_END_QUEUE_CONSTANTS.QUEUE_RETRY_DELAY,
                },
            },
        );
    }
}
