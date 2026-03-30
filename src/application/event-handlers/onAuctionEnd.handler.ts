import { IAuctionEndQueue } from '@application/interfaces/queue/IAuctionEndQueue';
import { TYPES } from '@di/types.di';
import { AuctionEnded } from '@domain/events/auction-end.event';
import { inject, injectable } from 'inversify';

@injectable()
export class OnAuctionEndHandler {
    constructor(
        @inject(TYPES.IAuctionEndQueue)
        private readonly _auctionEndQueue: IAuctionEndQueue,
    ) {}

    async handle(event: AuctionEnded): Promise<void> {
        try {
            await this._auctionEndQueue.enqueue({
                auctionId: event.auctionId,
                auctionTitle: event.auctionTitle,
                winnerId: event.winnerId,
                winAmount: event.winAmount,
                endedAt: event.endedAt,
            });
        } catch (error) {
            console.log('OnAuctionEndHandler enqueue failed', error);
        }
    }
}
