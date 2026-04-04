import { IFallbackPublicNotificationQueuePayload } from '@application/interfaces/queue/IFallbackPublicNotificationQueue';
import { IProcessFallbackPublicNotificationUsecase } from '@application/interfaces/usecases/auction/IProcessFallbackPublicNotificationUsecase';
import { redisConfig } from '@config/redis.config';
import { container } from '@di/container';
import { TYPES } from '@di/types.di';
import { FALLBACK_PUBLIC_NOTIFICATION_QUEUE_CONSTANTS } from '@infrastructure/constants/queue/FallbackPublicNotificationQuque.constatants';
import { Job, Worker } from 'bullmq';

export class FallbackPublicNotificationWorker {
    private readonly _worker: Worker;

    constructor() {
        this._worker = new Worker(
            FALLBACK_PUBLIC_NOTIFICATION_QUEUE_CONSTANTS.FALLBACK_PUBLIC_NOTIFICATION_QUEUE,
            this.processJob.bind(this),
            {
                connection: redisConfig,
            },
        );

        this._worker.on('active', (job) => {
            console.log(`Fallback public notification job ${job.id} active`);
        });

        this._worker.on('error', (err) => {
            console.error(
                `Fallback public notification worker error: ${err.message}`,
            );
        });

        this._worker.on('completed', (job) => {
            console.log(`Fallback public notification job ${job.id} completed`);
        });

        this._worker.on('failed', (job, err) => {
            console.error(
                `Fallback public notification job ${job?.id} failed: ${err.message}`,
            );
        });
    }

    private async processJob(
        job: Job<IFallbackPublicNotificationQueuePayload>,
    ): Promise<void> {
        console.log('START -- PROCESS FALLBACK PUBLIC NOTIFICATION');

        const processFallbackPublicNotificationUsecase =
            container.get<IProcessFallbackPublicNotificationUsecase>(
                TYPES.IProcessFallbackPublicNotificationUsecase,
            );
        const result = await processFallbackPublicNotificationUsecase.execute(
            job.data.auctionId,
        );

        if (result.isFailure) {
            console.log(
                `Fallback public notification job failed: ${result.getError()}`,
            );
        }
    }
}
