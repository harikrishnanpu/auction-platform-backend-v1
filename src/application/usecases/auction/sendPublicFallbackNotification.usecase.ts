import { IFallbackPublicNotificationQueue } from '@application/interfaces/queue/IFallbackPublicNotificationQueue';
import { ISendPublicFallbackPublicNotificationUsecase } from '@application/interfaces/usecases/auction/ISendPublicFallbackPublicNotificationUsecase';
import { TYPES } from '@di/types.di';
import { AuctionStatus } from '@domain/entities/auction/auction.entity';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class SendPublicFallbackNotificationUsecase implements ISendPublicFallbackPublicNotificationUsecase {
    constructor(
        @inject(TYPES.IAuctionRepository)
        private readonly _auctionRepository: IAuctionRepository,
        @inject(TYPES.IFallbackPublicNotificationQueue)
        private readonly _fallbackPublicNotificationQueue: IFallbackPublicNotificationQueue,
    ) {}

    async execute(auctionId: string): Promise<Result<void>> {
        console.log('START -- QUEUE FALLBACK PUBLIC');

        try {
            const auctionEntity =
                await this._auctionRepository.findById(auctionId);

            if (auctionEntity.isFailure) {
                throw new Error(auctionEntity.getError());
            }

            const auction = auctionEntity.getValue();

            if (!auction) {
                return Result.fail('Auction not found');
            }

            if (auction.getStatus() !== AuctionStatus.FALLBACK_ENDED) {
                return Result.fail('Auction is not ended');
            }

            await this._fallbackPublicNotificationQueue.enqueue({
                auctionId: auctionId,
            });

            return Result.ok();
        } catch (error) {
            console.log(error);
            return Result.fail(
                'UNEXPECTED ERROR FROM SEND PUBLIC FALLBACK NOTIFICATION USECASE',
            );
        }
    }
}
