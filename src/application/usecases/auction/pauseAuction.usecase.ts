import {
  IPauseAuctionInput,
  IPauseAuctionOutput,
} from '@application/dtos/auction/pause-auction.dto';
import { IPauseAuctionUsecase } from '@application/interfaces/usecases/auction/IPauseAuctionUsecase';
import {
  AuctionStatus,
  AuctionType,
  Auction,
} from '@domain/entities/auction/auction.entity';
import { TYPES } from '@di/types.di';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { AUCTION_MESSAGES } from '@application/constants/auction/auction.constants';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class PauseAuctionUsecase implements IPauseAuctionUsecase {
  constructor(
    @inject(TYPES.IAuctionRepository)
    private readonly _auctionRepository: IAuctionRepository,
  ) {}

  async execute(
    input: IPauseAuctionInput,
  ): Promise<Result<IPauseAuctionOutput>> {
    const existing = await this._auctionRepository.findById(input.auctionId);
    if (existing.isFailure) return Result.fail(existing.getError());

    const auction = existing.getValue();
    const isAdmin = !!input.isAdmin;

    if (!isAdmin && auction.getSellerId() !== input.userId) {
      return Result.fail(AUCTION_MESSAGES.NOT_AUTHORIZED_TO_END);
    }

    if (auction.getStatus() !== AuctionStatus.ACTIVE) {
      return Result.fail(AUCTION_MESSAGES.ONLY_ACTIVE_CAN_BE_PAUSED);
    }

    const paused = Auction.create({
      id: auction.getId(),
      sellerId: auction.getSellerId(),
      auctionType: auction.getAuctionType() as AuctionType,
      title: auction.getTitle(),
      description: auction.getDescription(),
      category: auction.getCategory(),
      condition: auction.getCondition(),
      startPrice: auction.getStartPrice(),
      minIncrement: auction.getMinIncrement(),
      startAt: auction.getStartAt(),
      endAt: auction.getEndAt(),
      status: AuctionStatus.PAUSED,
      antiSnipSeconds: auction.getAntiSnipSeconds(),
      extensionCount: auction.getExtensionCount(),
      maxExtensionCount: auction.getMaxExtensionCount(),
      bidCooldownSeconds: auction.getBidCooldownSeconds(),
      winnerId: auction.getWinnerId(),
      assets: auction.getAssets(),
    });

    if (paused.isFailure) return Result.fail(paused.getError());

    const saved = await this._auctionRepository.save(paused.getValue());
    if (saved.isFailure) return Result.fail(saved.getError());

    const out = saved.getValue();
    return Result.ok({ id: out.getId(), status: out.getStatus() });
  }
}
