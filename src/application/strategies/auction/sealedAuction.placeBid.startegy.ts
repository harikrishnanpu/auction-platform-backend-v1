import { IEncryptionService } from '@application/interfaces/services/IEncryptionService';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { TYPES } from '@di/types.di';
import { Auction } from '@domain/entities/auction/auction.entity';
import { Bid } from '@domain/entities/auction/bid.entity';
import { PlaceBidPolicyService } from '@domain/policies/auction/place-bid-policy.service';
import { Result } from '@domain/shared/result';
import { IPlaceBidStrategy } from '@domain/strategies/IPlaceBidStrategy';
import { inject } from 'inversify';

export class SealedAuctionPlaceBidStartegy implements IPlaceBidStrategy {
    constructor(
        @inject(TYPES.PlaceBidPolicyService)
        private readonly _placeBidPolicyService: PlaceBidPolicyService,
        @inject(TYPES.IIdGeneratingService)
        private readonly _idGeneratingService: IIdGeneratingService,
        @inject(TYPES.IEncryptionService)
        private readonly _encryptionService: IEncryptionService,
    ) {}

    validateAndCreateBid(input: {
        auction: Auction;
        userId: string;
        amount: number;
        latestBid: Bid | null;
        userLatestBid: Bid | null;
    }): Result<Bid> {
        const canPlaceBidResult = this._placeBidPolicyService.canPlaceBid({
            auction: input.auction,
            userId: input.userId,
            userBidAmount: input.amount,
            latestBid: input.latestBid,
            userLatestBid: input.userLatestBid,
        });

        if (canPlaceBidResult.isFailure) {
            return Result.fail(canPlaceBidResult.getError());
        }

        const encryptedAmount = this._encryptionService.encrypt(
            input.amount.toString(),
        );

        const newBidEntity = Bid.create({
            id: this._idGeneratingService.generateId(),
            auctionId: input.auction.getId(),
            userId: input.userId,
            amount: null,
            encryptedAmount: encryptedAmount.getValue(),
            createdAt: new Date(),
        });

        if (newBidEntity.isFailure) {
            return Result.fail(newBidEntity.getError());
        }

        return Result.ok(newBidEntity.getValue());
    }
}
