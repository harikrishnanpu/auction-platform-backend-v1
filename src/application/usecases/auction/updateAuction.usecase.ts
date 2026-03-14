import {
  IUpdateAuctionInput,
  IUpdateAuctionOutput,
} from '@application/dtos/auction/update-auction.dto';
import { IUpdateAuctionUsecase } from '@application/interfaces/usecases/auction/IUpdateAuctionUsecase';
import { TYPES } from '@di/types.di';
import {
  Auction,
  AuctionStatus,
} from '@domain/entities/auction/auction.entity';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class UpdateAuctionUsecase implements IUpdateAuctionUsecase {
  constructor(
    @inject(TYPES.IAuctionRepository)
    private readonly _auctionRepository: IAuctionRepository,
  ) {}

  async execute(
    input: IUpdateAuctionInput,
  ): Promise<Result<IUpdateAuctionOutput>> {
    const existing = await this._auctionRepository.findById(input.auctionId);
    if (existing.isFailure) return Result.fail(existing.getError());
    const auction = existing.getValue();
    if (auction.getSellerId() !== input.userId) {
      return Result.fail('Not authorized to update this auction');
    }
    if (auction.getStatus() !== AuctionStatus.DRAFT) {
      return Result.fail('Only draft auctions can be updated');
    }
    const updatedResult = Auction.create({
      id: auction.getId(),
      sellerId: auction.getSellerId(),
      auctionType: input.auctionType ?? auction.getAuctionType(),
      title: input.title,
      description: input.description,
      category: input.category,
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
      assets: auction.getAssets(),
    });
    if (updatedResult.isFailure) return Result.fail(updatedResult.getError());
    const updated = updatedResult.getValue();
    const updateResult = await this._auctionRepository.update(updated);
    if (updateResult.isFailure) return Result.fail(updateResult.getError());
    const saved = updateResult.getValue();
    const output: IUpdateAuctionOutput = {
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
      antiSnipSeconds: saved.getAntiSnipSeconds(),
      extensionCount: saved.getExtensionCount(),
      maxExtensionCount: saved.getMaxExtensionCount(),
      bidCooldownSeconds: saved.getBidCooldownSeconds(),
      winnerId: saved.getWinnerId(),
    };
    return Result.ok(output);
  }
}
