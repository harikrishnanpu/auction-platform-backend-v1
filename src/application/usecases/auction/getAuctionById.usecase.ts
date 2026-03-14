import {
  IGetAuctionByIdInput,
  IGetAuctionByIdOutput,
  IAuctionAssetDto,
} from '@application/dtos/auction/get-auction-by-id.dto';
import { IGetAuctionByIdUsecase } from '@application/interfaces/usecases/auction/IGetAuctionByIdUsecase';
import { TYPES } from '@di/types.di';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class GetAuctionByIdUsecase implements IGetAuctionByIdUsecase {
  constructor(
    @inject(TYPES.IAuctionRepository)
    private readonly _auctionRepository: IAuctionRepository,
  ) {}

  async execute(
    input: IGetAuctionByIdInput,
  ): Promise<Result<IGetAuctionByIdOutput>> {
    const result = await this._auctionRepository.findById(input.auctionId);
    if (result.isFailure) return Result.fail(result.getError());
    const auction = result.getValue();
    const assets: IAuctionAssetDto[] = auction.getAssets().map((a) => ({
      id: a.getId(),
      auctionId: a.getAuctionId(),
      fileKey: a.getFileKey(),
      position: a.getPosition(),
      assetType: a.getAssetType(),
    }));
    const output: IGetAuctionByIdOutput = {
      id: auction.getId(),
      sellerId: auction.getSellerId(),
      auctionType: auction.getAuctionType(),
      title: auction.getTitle(),
      description: auction.getDescription(),
      category: auction.getCategory(),
      condition: auction.getCondition(),
      startPrice: auction.getStartPrice(),
      minIncrement: auction.getMinIncrement(),
      startAt: auction.getStartAt().toISOString(),
      endAt: auction.getEndAt().toISOString(),
      status: auction.getStatus(),
      assets,
      antiSnipSeconds: auction.getAntiSnipSeconds(),
      extensionCount: auction.getExtensionCount(),
      maxExtensionCount: auction.getMaxExtensionCount(),
      bidCooldownSeconds: auction.getBidCooldownSeconds(),
      winnerId: auction.getWinnerId(),
    };
    return Result.ok(output);
  }
}
