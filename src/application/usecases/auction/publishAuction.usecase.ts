import {
  IPublishAuctionInput,
  IPublishAuctionOutput,
} from '@application/dtos/auction/publish-auction.dto';
import { IPublishAuctionUsecase } from '@application/interfaces/usecases/auction/IPublishAuctionUsecase';
import { TYPES } from '@di/types.di';
import {
  Auction,
  AuctionStatus,
} from '@domain/entities/auction/auction.entity';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';
import { publishAuctionSchema } from '@presentation/validators/schemas/auction/publishAuction.schema';

@injectable()
export class PublishAuctionUsecase implements IPublishAuctionUsecase {
  constructor(
    @inject(TYPES.IAuctionRepository)
    private readonly _auctionRepository: IAuctionRepository,
  ) {}

  async execute(
    input: IPublishAuctionInput,
  ): Promise<Result<IPublishAuctionOutput>> {
    const existing = await this._auctionRepository.findById(input.auctionId);
    if (existing.isFailure) {
      return Result.fail(existing.getError());
    }

    const auction = existing.getValue();

    if (auction.getSellerId() !== input.userId) {
      return Result.fail('Not authorized to publish this auction');
    }

    if (auction.getStatus() !== AuctionStatus.DRAFT) {
      return Result.fail('Only draft auctions can be published');
    }

    const now = new Date();
    if (auction.getEndAt() <= now) {
      return Result.fail('Cannot publish auction: end time has already passed');
    }

    const draftForValidation = {
      auctionType: auction.getAuctionType(),
      title: auction.getTitle(),
      description: auction.getDescription(),
      category: auction.getCategory(),
      condition: auction.getCondition(),
      startPrice: auction.getStartPrice(),
      minIncrement: auction.getMinIncrement(),
      startAt: auction.getStartAt(),
      endAt: auction.getEndAt(),
      antiSnipSeconds: auction.getAntiSnipSeconds(),
      maxExtensionCount: auction.getMaxExtensionCount(),
      bidCooldownSeconds: auction.getBidCooldownSeconds(),
      assets: auction.getAssets().map((a) => ({
        id: a.getId(),
        auctionId: a.getAuctionId(),
        fileKey: a.getFileKey(),
        position: a.getPosition(),
        assetType: a.getAssetType(),
      })),
    };

    const validation = publishAuctionSchema.safeParse(draftForValidation);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      const message =
        firstError.path.length > 0
          ? `${firstError.path.join('.')}: ${firstError.message}`
          : firstError.message;
      return Result.fail(message);
    }

    const publishedResult = Auction.create({
      id: auction.getId(),
      sellerId: auction.getSellerId(),
      auctionType: auction.getAuctionType(),
      title: auction.getTitle(),
      description: auction.getDescription(),
      category: auction.getCategory(),
      condition: auction.getCondition(),
      startPrice: auction.getStartPrice(),
      minIncrement: auction.getMinIncrement(),
      startAt: auction.getStartAt(),
      endAt: auction.getEndAt(),
      status: AuctionStatus.ACTIVE,
      antiSnipSeconds: auction.getAntiSnipSeconds(),
      extensionCount: auction.getExtensionCount(),
      maxExtensionCount: auction.getMaxExtensionCount(),
      bidCooldownSeconds: auction.getBidCooldownSeconds(),
      winnerId: auction.getWinnerId(),
      assets: auction.getAssets(),
    });

    if (publishedResult.isFailure) {
      return Result.fail(publishedResult.getError());
    }

    const published = publishedResult.getValue();

    const updateResult = await this._auctionRepository.update(published);
    if (updateResult.isFailure) {
      return Result.fail(updateResult.getError());
    }

    if (updateResult.isFailure) {
      return Result.fail(updateResult.getError());
    }

    const saved = updateResult.getValue();

    const output: IPublishAuctionOutput = {
      id: saved.getId(),
      status: saved.getStatus(),
    };

    return Result.ok(output);
  }
}
