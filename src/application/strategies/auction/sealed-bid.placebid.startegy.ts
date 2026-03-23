import {
    IPlaceBidInput,
    IValidatedBidPayload,
} from '@application/dtos/auction/place-bid.dto';
import { IEncryptionService } from '@application/interfaces/services/IEncryptionService';
import { IPlaceBidStrategy } from '@application/interfaces/strategies/auction/placeBid.strategy';
import { TYPES } from '@di/types.di';
import { Auction } from '@domain/entities/auction/auction.entity';
import { Bid } from '@domain/entities/auction/bid.entity';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class PlaceSealedAuctionBidStrategy implements IPlaceBidStrategy {
    constructor(
        @inject(TYPES.IEncryptionService)
        private readonly _encryptionService: IEncryptionService,
    ) {}

    validate(data: IPlaceBidInput): Result<IValidatedBidPayload> {
        const encryptedAmount = this._encryptionService.encrypt(
            data.amount.toString(),
        );
        if (encryptedAmount.isFailure)
            return Result.fail(encryptedAmount.getError());

        return Result.ok({
            amount: null,
            encryptedAmount: encryptedAmount.getValue(),
        });
    }

    applyRules({
        input,
        auction,
        latestBid,
    }: {
        input: IPlaceBidInput;
        auction: Auction;
        latestBid: Bid | null;
    }): Result<void> {
        console.log(input, auction, latestBid);

        return Result.ok();
    }
}
