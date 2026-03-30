import { IEncryptionService } from '@application/interfaces/services/IEncryptionService';
import {
    IAuctionWinnerResult,
    IAuctionWinnerStrategy,
} from '@domain/strategies/IAuctionWinnerStrategy';
import { TYPES } from '@di/types.di';
import { IBidRepository } from '@domain/repositories/IBidRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';
import { Auction } from '@domain/entities/auction/auction.entity';

@injectable()
export class SealedAuctionWinnerStrategy implements IAuctionWinnerStrategy {
    constructor(
        @inject(TYPES.IBidRepository)
        private readonly _bidRepository: IBidRepository,
        @inject(TYPES.IEncryptionService)
        private readonly _encryptionService: IEncryptionService,
    ) {}

    async validateAndGetWinner({
        auction,
    }: {
        auction: Auction;
    }): Promise<Result<IAuctionWinnerResult>> {
        const bidsResult = await this._bidRepository.findAllByAuctionId(
            auction.getId(),
        );
        if (bidsResult.isFailure) return Result.fail(bidsResult.getError());

        const bids = bidsResult.getValue();
        if (bids.length === 0) {
            return Result.ok({ winnerId: null, winAmount: 0 });
        }

        let maxBidAmount = 0;
        let winnerId: string | null = null;

        for (const bid of bids) {
            const encryptedAmount = bid.getEncryptedAmount();
            if (!encryptedAmount) continue;

            const decrypted = this._encryptionService.decrypt(encryptedAmount);
            if (decrypted.isFailure) return Result.fail(decrypted.getError());

            const amount = Number(decrypted.getValue());
            if (!Number.isFinite(amount)) {
                return Result.fail('Invalid decrypted sealed bid amount');
            }

            if (amount > maxBidAmount) {
                maxBidAmount = amount;
                winnerId = bid.getUserId();
            }
        }

        return Result.ok({ winnerId, winAmount: maxBidAmount });
    }
}
