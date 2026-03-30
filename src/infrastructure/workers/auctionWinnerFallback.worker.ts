import { IAuctionWinnerFallbackJobPayload } from '@application/interfaces/queue/IWinnerFallbackQueue';
import { IProcessAuctionWinnerFallbackUsecase } from '@application/interfaces/usecases/auction/IProcessWinnerFallbackUsecase';
import { redisConfig } from '@config/redis.config';
import { container } from '@di/container';
import { TYPES } from '@di/types.di';
import { WINNER_FALLBACK_QUEUE_CONSTANTS } from '@infrastructure/constants/queue/winnerFallback.queue.constants';
import { Job, Worker } from 'bullmq';

export class AuctionWinnerFallbackWorker {
    private readonly _worker: Worker;

    constructor() {
        this._worker = new Worker(
            WINNER_FALLBACK_QUEUE_CONSTANTS.WINNER_FALLBACK_QUEUE,
            this.processJob.bind(this),
            { connection: redisConfig },
        );

        this._worker.on('completed', (job) => {
            console.log(`Winner fallback job ${job.id} completed`);
        });

        this._worker.on('failed', (job, err) => {
            console.error(
                `Winner fallback job ${job?.id} failed: ${err.message}`,
            );
        });
    }

    private async processJob(
        job: Job<IAuctionWinnerFallbackJobPayload>,
    ): Promise<void> {
        const usecase = container.get<IProcessAuctionWinnerFallbackUsecase>(
            TYPES.IProcessAuctionWinnerFallbackUsecase,
        );

        const result = await usecase.execute({
            auctionId: job.data.auctionId,
            declinedUserId: job.data.declinedUserId,
        });

        if (result.isFailure) {
            throw new Error(result.getError());
        }
    }
}
