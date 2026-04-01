import {
    IGetFallBackAuctionWinnerInput,
    IGetFallBackAuctionWinnerOutput,
    IGetFallBackAuctionWinnerStrategy,
} from '@application/interfaces/strategies/auction/getFallBackWinner.stratgy';
import { IEncryptionService } from '@application/interfaces/services/IEncryptionService';
import { TYPES } from '@di/types.di';
import { AuctionType } from '@domain/entities/auction/auction.entity';
import { Bid } from '@domain/entities/auction/bid.entity';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { IBidRepository } from '@domain/repositories/IBidRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';
import { IAuctionWinnerRepository } from '@domain/repositories/IAuctionWinnerRepo';
import { AUCTION_WINNER_FALLBACK_CONSTANTS } from '@domain/constants/auction.constants';

@injectable()
export class GetFallBackAuctionWinnerStartegy implements IGetFallBackAuctionWinnerStrategy {
    constructor(
        @inject(TYPES.IAuctionRepository)
        private readonly _auctionRepository: IAuctionRepository,
        @inject(TYPES.IBidRepository)
        private readonly _bidRepository: IBidRepository,
        @inject(TYPES.IEncryptionService)
        private readonly _encryptionService: IEncryptionService,
        @inject(TYPES.IAuctionWinnerRepository)
        private readonly _auctionWinnerRepository: IAuctionWinnerRepository,
    ) {}

    async execute(
        input: IGetFallBackAuctionWinnerInput,
    ): Promise<Result<IGetFallBackAuctionWinnerOutput>> {
        const auctionResult = await this._auctionRepository.findById(
            input.auctionId,
        );

        const allAuctionWinnersResult =
            await this._auctionWinnerRepository.findAllByAuctionId(
                input.auctionId,
            );

        if (auctionResult.isFailure || allAuctionWinnersResult.isFailure) {
            return Result.fail(
                auctionResult.getError() || allAuctionWinnersResult.getError(),
            );
        }

        const allAuctionWinners = allAuctionWinnersResult.getValue();

        if (
            allAuctionWinners.length >=
            AUCTION_WINNER_FALLBACK_CONSTANTS.MAX_RANK
        ) {
            return Result.ok({ winnerId: null, winAmount: null, rank: 0 });
        }

        const nextRank = allAuctionWinners.length + 1;

        if (allAuctionWinners.length === 0) {
            return Result.ok({ winnerId: null, winAmount: null, rank: 0 });
        }

        const bidsResult = await this._bidRepository.findAllByAuctionId(
            input.auctionId,
        );

        if (bidsResult.isFailure) {
            return Result.fail(bidsResult.getError());
        }

        const eligibleBids = bidsResult
            .getValue()
            .filter(
                (b) =>
                    !allAuctionWinners.some(
                        (winner) => winner.getUserId() === b.getUserId(),
                    ),
            );

        if (eligibleBids.length === 0) {
            return Result.ok({ winnerId: null, winAmount: null, rank: 0 });
        }

        const auctionType = auctionResult.getValue().getAuctionType();

        if (auctionType === AuctionType.SEALED) {
            return this.resolveSealedWinner(eligibleBids, nextRank);
        }

        return this.resolveAuctionWinner(eligibleBids, nextRank);
    }

    private resolveAuctionWinner(
        bids: Bid[],
        rank: number,
    ): Result<IGetFallBackAuctionWinnerOutput> {
        const winner = bids.reduce(
            (maxBid, bid) =>
                bid.getAmount()! > maxBid.getAmount()! ? bid : maxBid,
            bids[0],
        );

        return Result.ok({
            winnerId: winner.getUserId(),
            winAmount: Number(winner.getAmount()),
            rank,
        });
    }

    private resolveSealedWinner(
        bids: Bid[],
        rank: number,
    ): Result<IGetFallBackAuctionWinnerOutput> {
        let maxAmount = 0;
        let winnerId: string | null = null;

        for (const bid of bids) {
            const encrypted = bid.getEncryptedAmount();
            if (!encrypted) continue;

            const decrypted = this._encryptionService.decrypt(encrypted);
            if (decrypted.isFailure) {
                return Result.fail(decrypted.getError());
            }

            const amount = Number(decrypted.getValue());
            if (!Number.isFinite(amount)) {
                return Result.fail('Invalid decrypted sealed bid amount');
            }

            if (amount > maxAmount) {
                maxAmount = amount;
                winnerId = bid.getUserId();
            }
        }

        if (winnerId === null) {
            return Result.ok({ winnerId: null, winAmount: null, rank: 0 });
        }

        return Result.ok({
            winnerId,
            winAmount: maxAmount,
            rank,
        });
    }
}
