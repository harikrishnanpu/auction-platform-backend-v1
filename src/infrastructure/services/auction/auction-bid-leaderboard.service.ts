import { IEncryptionService } from '@application/interfaces/services/IEncryptionService';
import {
    AuctionBidLeaderboardEntry,
    IAuctionBidLeaderboardService,
} from '@application/interfaces/services/IAuctionBidLeaderboardService';
import { TYPES } from '@di/types.di';
import { AuctionType } from '@domain/entities/auction/auction.entity';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { IBidRepository } from '@domain/repositories/IBidRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class AuctionBidLeaderboardService implements IAuctionBidLeaderboardService {
    constructor(
        @inject(TYPES.IAuctionRepository)
        private readonly _auctionRepository: IAuctionRepository,
        @inject(TYPES.IBidRepository)
        private readonly _bidRepository: IBidRepository,
        @inject(TYPES.IEncryptionService)
        private readonly _encryptionService: IEncryptionService,
    ) {}

    async getRankedUniqueBidders(
        auctionId: string,
    ): Promise<Result<AuctionBidLeaderboardEntry[]>> {
        const auctionResult = await this._auctionRepository.findById(auctionId);
        if (auctionResult.isFailure) {
            return Result.fail(auctionResult.getError());
        }

        const auction = auctionResult.getValue();
        const bidsResult =
            await this._bidRepository.findAllByAuctionId(auctionId);
        if (bidsResult.isFailure) {
            return Result.fail(bidsResult.getError());
        }

        const bids = bidsResult.getValue();
        const bestByUser = new Map<string, number>();
        const auctionType = auction.getAuctionType();

        if (auctionType === AuctionType.SEALED) {
            for (const bid of bids) {
                const encryptedAmount = bid.getEncryptedAmount();
                if (!encryptedAmount) continue;

                const decrypted =
                    this._encryptionService.decrypt(encryptedAmount);
                if (decrypted.isFailure) {
                    return Result.fail(decrypted.getError());
                }

                const amount = Number(decrypted.getValue());
                if (!Number.isFinite(amount)) {
                    return Result.fail('Invalid decrypted sealed bid amount');
                }

                const userId = bid.getUserId();
                const prev = bestByUser.get(userId) ?? -Infinity;
                if (amount > prev) {
                    bestByUser.set(userId, amount);
                }
            }
        } else {
            for (const bid of bids) {
                const amount = Number(bid.getAmount());
                if (!Number.isFinite(amount)) continue;

                const userId = bid.getUserId();
                const prev = bestByUser.get(userId) ?? -Infinity;
                if (amount > prev) {
                    bestByUser.set(userId, amount);
                }
            }
        }

        const entries: AuctionBidLeaderboardEntry[] = [...bestByUser.entries()]
            .map(([userId, winningAmount]) => ({ userId, winningAmount }))
            .sort((a, b) => b.winningAmount - a.winningAmount);

        return Result.ok(entries);
    }
}
