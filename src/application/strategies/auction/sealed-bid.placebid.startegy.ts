import { IPlaceBidInput } from '@application/dtos/auction/place-bid.dto';
import { IPlaceBidStrategy } from '@application/interfaces/strategies/auction/placeBid.strategy';
import { Result } from '@domain/shared/result';

export class PlaceSealedAuctionBidStrategy implements IPlaceBidStrategy {
  validate(data: IPlaceBidInput): Result<IPlaceBidInput> {
    const bid = {
      ...data,
      amount: data.amount,
    };

    return Result.ok(bid);
  }
}
