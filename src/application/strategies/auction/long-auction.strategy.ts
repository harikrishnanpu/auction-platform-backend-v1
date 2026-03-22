import { ICreateAuctionInputDto } from '@application/dtos/auction/create-auction.dto';
import { IAuctionCreateStrategy } from '@application/interfaces/strategies/auction/auction-create.strategy';
import { Result } from '@domain/shared/result';

export class LongAuctionCreateStrategy implements IAuctionCreateStrategy {
  validate(data: ICreateAuctionInputDto): Result<ICreateAuctionInputDto> {
    if (data.minIncrement < 1) {
      return Result.fail('Min increment must be greater than 1');
    }

    if (data.maxExtensionCount > 10) {
      return Result.fail('Max extension count must be less than 10');
    }

    if (data.maxExtensionCount < 0) {
      return Result.fail('Max extension count must be greater than 0');
    }

    return Result.ok(data);
  }
}
