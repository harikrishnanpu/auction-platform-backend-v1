import {
  IGetSellerAuctionsInput,
  IGetSellerAuctionsOutput,
  IAuctionListItemDto,
} from '@application/dtos/auction/get-seller-auctions.dto';
import { IGetSellerAuctionsUsecase } from '@application/interfaces/usecases/auction/IGetSellerAuctionsUsecase';
import { TYPES } from '@di/types.di';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class GetSellerAuctionsUsecase implements IGetSellerAuctionsUsecase {
  constructor(
    @inject(TYPES.IAuctionRepository)
    private readonly _auctionRepository: IAuctionRepository,
  ) {}

  async execute(
    input: IGetSellerAuctionsInput,
  ): Promise<Result<IGetSellerAuctionsOutput>> {
    const result = await this._auctionRepository.findBySellerId(input.sellerId);
    if (result.isFailure) return Result.fail(result.getError());

    const auctions = result.getValue();
    const dtos: IAuctionListItemDto[] = auctions.map((a) => {
      const assets = a.getAssets();
      const primary = assets.sort(
        (x, y) => x.getPosition() - y.getPosition(),
      )[0];
      return {
        id: a.getId(),
        sellerId: a.getSellerId(),
        auctionType: a.getAuctionType(),
        title: a.getTitle(),
        description: a.getDescription(),
        category: a.getCategory(),
        condition: a.getCondition(),
        startPrice: a.getStartPrice(),
        minIncrement: a.getMinIncrement(),
        startAt: a.getStartAt().toISOString(),
        endAt: a.getEndAt().toISOString(),
        status: a.getStatus(),
        assetCount: assets.length,
        primaryImageKey: primary?.getFileKey(),
        antiSnipSeconds: a.getAntiSnipSeconds(),
        extensionCount: a.getExtensionCount(),
        maxExtensionCount: a.getMaxExtensionCount(),
        bidCooldownSeconds: a.getBidCooldownSeconds(),
        winnerId: a.getWinnerId(),
      };
    });
    return Result.ok({ auctions: dtos });
  }
}
