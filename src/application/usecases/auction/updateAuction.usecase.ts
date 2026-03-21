import { AUCTION_MESSAGES } from '@application/constants/auction/auction.constants';
import {
  IUpdateAuctionInput,
  IUpdateAuctionOutput,
} from '@application/dtos/auction/update-auction.dto';
import { IUpdateAuctionUsecase } from '@application/interfaces/usecases/auction/IUpdateAuctionUsecase';
import { TYPES } from '@di/types.di';
import { IAuctionCategoryRepository } from '@domain/repositories/IAuctionCategoryRepo';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
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
import { AuctionMapperProrfile } from '@application/mappers/auction/auction.mapperProfile';

@injectable()
export class UpdateAuctionUsecase implements IUpdateAuctionUsecase {
  constructor(
    @inject(TYPES.IAuctionRepository)
    private readonly _auctionRepository: IAuctionRepository,
    @inject(TYPES.IAuctionCategoryRepository)
    private readonly _auctionCategoryRepository: IAuctionCategoryRepository,
    @inject(TYPES.IIdGeneratingService)
    private readonly _idGeneratingService: IIdGeneratingService,
  ) {}

  async execute(
    input: IUpdateAuctionInput,
  ): Promise<Result<IUpdateAuctionOutput>> {
    console.log('UPDATE AUCTION INPUT: ', input);

    const existing = await this._auctionRepository.findById(input.auctionId);

    if (existing.isFailure) {
      return Result.fail(existing.getError());
    }

    const auction = existing.getValue();

    if (auction.getSellerId() !== input.userId) {
      return Result.fail(AUCTION_MESSAGES.NOT_AUTHORIZED_TO_UPDATE);
    }

    if (auction.getStatus() !== AuctionStatus.DRAFT) {
      return Result.fail(AUCTION_MESSAGES.ONLY_DRAFT_CAN_BE_UPDATED);
    }

    const categoryResult = await this._auctionCategoryRepository.findById(
      input.category,
    );
    if (categoryResult.isFailure) return Result.fail(categoryResult.getError());
    const category = categoryResult.getValue();
    if (!category) return Result.fail('Auction category not found');

    const assets =
      input.assets && input.assets.length > 0
        ? input.assets.map((a, idx) =>
            AuctionAsset.create({
              id: this._idGeneratingService.generateId(),
              auctionId: auction.getId(),
              fileKey: a.fileKey,
              position: a.position ?? idx,
              assetType: a.assetType ?? AuctionAssetType.IMAGE,
            }),
          )
        : auction.getAssets();

    const updatedResult = Auction.create({
      id: auction.getId(),
      sellerId: auction.getSellerId(),
      auctionType: input.auctionType ?? auction.getAuctionType(),
      title: input.title,
      description: input.description,
      category,
      condition: input.condition,
      startPrice: input.startPrice,
      minIncrement: input.minIncrement,
      startAt: input.startAt,
      endAt: input.endAt,
      status: AuctionStatus.DRAFT,
      antiSnipSeconds: input.antiSnipSeconds ?? auction.getAntiSnipSeconds(),
      extensionCount: auction.getExtensionCount(),
      maxExtensionCount:
        input.maxExtensionCount ?? auction.getMaxExtensionCount(),
      bidCooldownSeconds:
        input.bidCooldownSeconds ?? auction.getBidCooldownSeconds(),
      winnerId: auction.getWinnerId(),
      assets,
    });

    if (updatedResult.isFailure) {
      return Result.fail(updatedResult.getError());
    }

    const updated = updatedResult.getValue();

    const updateResult = await this._auctionRepository.save(updated);

    if (updateResult.isFailure) return Result.fail(updateResult.getError());

    const saved = updateResult.getValue();

    const dto = AuctionMapperProrfile.toAuctionOutputDto(saved);

    return Result.ok({ auction: dto });
  }
}
