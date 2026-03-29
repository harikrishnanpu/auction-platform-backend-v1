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
export class LongAuctionWinnerStrategy implements IAuctionWinnerStrategy {
    constructor(
        @inject(TYPES.IBidRepository)
        private readonly _bidRepository: IBidRepository,
    ) {}

    async validateAndGetWinner({
        auction,
    }: {
        auction: Auction;
    }): Promise<Result<IAuctionWinnerResult>> {
        const allBidsResult = await this._bidRepository.findAllByAuctionId(
            auction.getId(),
        );

        if (allBidsResult.isFailure)
            return Result.fail(allBidsResult.getError());

        const allBids = allBidsResult.getValue();
        if (allBids.length === 0)
            return Result.ok({ winnerId: null, winAmount: 0 });

        const winner = allBids.reduce((maxBid, bid) => {
            return bid.getAmount()! > maxBid.getAmount()! ? bid : maxBid;
        }, allBids[0]);

        if (!winner) return Result.ok({ winnerId: null, winAmount: 0 });

        const validatedOuput = {
            winnerId: winner.getUserId(),
            winAmount: Number(winner.getAmount()),
        };

        return Result.ok(validatedOuput);
    }
}
