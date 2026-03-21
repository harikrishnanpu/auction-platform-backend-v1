import {
  IResumeAuctionInput,
  IResumeAuctionOutput,
} from '@application/dtos/auction/resume-auction.dto';
import { IResumeAuctionUsecase } from '@application/interfaces/usecases/auction/IResumeAuctionUsecase';
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
export class ResumeAuctionUsecase implements IResumeAuctionUsecase {
  constructor(
    @inject(TYPES.IAuctionRepository)
    private readonly _auctionRepository: IAuctionRepository,
  ) {}

  async execute(
    input: IResumeAuctionInput,
  ): Promise<Result<IResumeAuctionOutput>> {
    const existing = await this._auctionRepository.findById(input.auctionId);
    if (existing.isFailure) return Result.fail(existing.getError());

    const auction = existing.getValue();
    const isAdmin = input.isAdmin ?? false;

    if (!isAdmin && auction.getSellerId() !== input.userId) {
      return Result.fail(AUCTION_MESSAGES.NOT_AUTHORIZED_TO_END);
    }

    if (auction.getStatus() !== AuctionStatus.PAUSED) {
      return Result.fail(AUCTION_MESSAGES.ONLY_PAUSED_CAN_BE_RESUMED);
    }

    const resumed = Auction.create({
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
      status: AuctionStatus.ACTIVE,
      antiSnipSeconds: auction.getAntiSnipSeconds(),
      extensionCount: auction.getExtensionCount(),
      maxExtensionCount: auction.getMaxExtensionCount(),
      bidCooldownSeconds: auction.getBidCooldownSeconds(),
      winnerId: auction.getWinnerId(),
      assets: auction.getAssets(),
    });

    if (resumed.isFailure) return Result.fail(resumed.getError());

    const saved = await this._auctionRepository.save(resumed.getValue());
    if (saved.isFailure) return Result.fail(saved.getError());

    const out = saved.getValue();
    return Result.ok({ id: out.getId(), status: out.getStatus() });
  }
}
