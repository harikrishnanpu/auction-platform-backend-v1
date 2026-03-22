import { ICreateAuctionInputDto } from '@application/dtos/auction/create-auction.dto';
import { IAuctionCreateStrategy } from '@application/interfaces/strategies/auction/auction-create.strategy';
import { AuctionType } from '@domain/entities/auction/auction.entity';
import { Result } from '@domain/shared/result';

export class SealedAuctionCreateStrategy implements IAuctionCreateStrategy {
  validate(data: ICreateAuctionInputDto): Result<ICreateAuctionInputDto> {
    const auction: ICreateAuctionInputDto = {
      ...data,
      auctionType: AuctionType.SEALED,
      minIncrement: 0,
      antiSnipSeconds: 0,
      maxExtensionCount: 0,
      bidCooldownSeconds: 0,
    };

    return Result.ok(auction);
  }
}
