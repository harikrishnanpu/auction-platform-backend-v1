import {
  ICreateAuctionInput,
  ICreateAuctionOutput,
} from '@application/dtos/auction/create-auction.dto';
import { ICreateAuctionUsecase } from '@application/interfaces/usecases/auction/ICreateAuctionUsecase';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { TYPES } from '@di/types.di';
import {
  Auction,
  AuctionStatus,
} from '@domain/entities/auction/auction.entity';
import {
  AuctionAsset,
  AuctionAssetType,
} from '@domain/entities/auction/auction-asset.entity';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class CreateAuctionUsecase implements ICreateAuctionUsecase {
  constructor(
    @inject(TYPES.IAuctionRepository)
    private readonly _auctionRepository: IAuctionRepository,
    @inject(TYPES.IIdGeneratingService)
    private readonly _idGeneratingService: IIdGeneratingService,
  ) {}

  async execute(
    input: ICreateAuctionInput,
  ): Promise<Result<ICreateAuctionOutput>> {
    const auctionId = this._idGeneratingService.generateId();
    const assets = (input.assets ?? []).map((a, index) =>
      AuctionAsset.create({
        id: this._idGeneratingService.generateId(),
        auctionId,
        fileKey: a.fileKey,
        position: a.position ?? index,
        assetType: a.assetType ?? AuctionAssetType.IMAGE,
      }),
    );
    const auctionResult = Auction.create({
      id: auctionId,
      sellerId: input.userId,
      auctionType: input.auctionType,
      title: input.title,
      description: input.description,
      category: input.category,
      condition: input.condition,
      startPrice: input.startPrice,
      minIncrement: input.minIncrement,
      startAt: input.startAt,
      endAt: input.endAt,
      status: AuctionStatus.DRAFT,
      antiSnipSeconds: input.antiSnipSeconds,
      maxExtensionCount: input.maxExtensionCount,
      bidCooldownSeconds: input.bidCooldownSeconds,
      assets,
    });
    if (auctionResult.isFailure) return Result.fail(auctionResult.getError());
    const auction = auctionResult.getValue();
    const saveResult = await this._auctionRepository.save(auction);
    if (saveResult.isFailure) return Result.fail(saveResult.getError());
    const saved = saveResult.getValue();
    const output: ICreateAuctionOutput = {
      id: saved.getId(),
      sellerId: saved.getSellerId(),
      auctionType: saved.getAuctionType(),
      title: saved.getTitle(),
      description: saved.getDescription(),
      category: saved.getCategory(),
      condition: saved.getCondition(),
      startPrice: saved.getStartPrice(),
      minIncrement: saved.getMinIncrement(),
      startAt: saved.getStartAt().toISOString(),
      endAt: saved.getEndAt().toISOString(),
      status: saved.getStatus(),
      assetCount: saved.getAssets().length,
    };
    return Result.ok(output);
  }
}
