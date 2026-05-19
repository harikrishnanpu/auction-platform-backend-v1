import { IExpireOverdueAuctionsUsecase } from '@application/interfaces/usecases/auction/IExpireOverdueAuctionsUsecase';
import { container } from '@di/container';
import { TYPES } from '@di/types.di';
import cron, { ScheduledTask } from 'node-cron';

class AuctionExpiryCron {
    private _job: ScheduledTask;

    private constructor(
        private readonly _expireOverdueAuctionsUsecase: IExpireOverdueAuctionsUsecase,
    ) {
        const schedule = process.env.AUCTION_EXPIRY_CRON_SCHEDULE;
        if (!schedule) {
            throw new Error('AUCTION_EXPIRY_CRON_SCHEDULE is not set');
        }
        this._job = cron.schedule(
            schedule,
            this._expireOverdueAuctionsUsecase.execute,
        );
        // this.initJob();
    }

    static async start() {
        const expireOverdueAuctionsUsecase =
            container.get<IExpireOverdueAuctionsUsecase>(
                TYPES.IExpireOverdueAuctionsUsecase,
            );
        const auctionExpiryCron = new AuctionExpiryCron(
            expireOverdueAuctionsUsecase,
        );
        await auctionExpiryCron.initJob();
    }

    private async initJob() {
        this._job.start();
    }

    private async stopJob() {
        this._job.stop();
    }
}

export default AuctionExpiryCron;
