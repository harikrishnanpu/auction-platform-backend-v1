import { redisConfig } from '@config/redis.config';
import { IProcessAuctionEndNotificationUsecase } from '@application/interfaces/usecases/auction/IProcessAuctionEndUsecase';
import { container } from '@di/container';
import { TYPES } from '@di/types.di';
import { AUCTION_END_QUEUE_CONSTANTS } from '@infrastructure/constants/queue/auctionEnd.queue.constants';
import { Job, Worker } from 'bullmq';
import { IAuctionEndQueuePayload } from '@application/interfaces/queue/IAuctionEndQueue';

export class AuctionEndWorker {
    private readonly _worker: Worker;

    constructor() {
        this._worker = new Worker(
            AUCTION_END_QUEUE_CONSTANTS.AUCTION_END_QUEUE,
            this.processJob.bind(this),
            { connection: redisConfig },
        );

        this._worker.on('completed', (job) => {
            console.log(`Auction end job ${job.id} completed`);
        });

        this._worker.on('failed', (job, err) => {
            console.error(`Auction end job ${job?.id} failed: ${err.message}`);
        });
    }

    private async processJob(job: Job<IAuctionEndQueuePayload>): Promise<void> {
        const processAuctionEndNotificationUsecase =
            container.get<IProcessAuctionEndNotificationUsecase>(
                TYPES.IProcessAuctionEndNotificationUsecase,
            );

        const processAuctionEndNotificationResult =
            await processAuctionEndNotificationUsecase.execute({
                auctionId: job.data.auctionId,
                auctionTitle: job.data.auctionTitle,
                winnerId: job.data.winnerId,
                winAmount: job.data.winAmount,
                endedAt: job.data.endedAt,
            });

        if (processAuctionEndNotificationResult.isFailure) {
            console.log(
                `Auction end job ${job.id} failed: ${processAuctionEndNotificationResult.getError()}`,
            );
        }
    }
}
