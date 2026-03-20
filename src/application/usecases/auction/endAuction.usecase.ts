import { AUCTION_MESSAGES } from '@application/constants/auction/auction.constants';
import {
  IEndAuctionInput,
  IEndAuctionOutput,
} from '@application/dtos/auction/end-auction.dto';
import { IEndAuctionUsecase } from '@application/interfaces/usecases/auction/IEndAuctionUsecase';
import { TYPES } from '@di/types.di';
import {
  Auction,
  AuctionStatus,
} from '@domain/entities/auction/auction.entity';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { IBidRepository } from '@domain/repositories/IBidRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class EndAuctionUsecase implements IEndAuctionUsecase {
  constructor(
    @inject(TYPES.IAuctionRepository)
    private readonly _auctionRepository: IAuctionRepository,
    @inject(TYPES.IBidRepository)
    private readonly _bidRepository: IBidRepository,
  ) {}

  async execute(input: IEndAuctionInput): Promise<Result<IEndAuctionOutput>> {
    const existing = await this._auctionRepository.findById(input.auctionId);
    if (existing.isFailure) return Result.fail(existing.getError());

    const auction = existing.getValue();
    if (auction.getSellerId() !== input.userId) {
      return Result.fail(AUCTION_MESSAGES.NOT_AUTHORIZED_TO_END);
    }

    if (auction.getStatus() !== AuctionStatus.ACTIVE) {
      return Result.fail(AUCTION_MESSAGES.ONLY_ACTIVE_CAN_BE_ENDED);
    }

    const latestBidResult = await this._bidRepository.findLatestByAuctionId(
      input.auctionId,
    );
    const winnerId =
      latestBidResult.isSuccess && latestBidResult.getValue()
        ? latestBidResult.getValue()!.getUserId()
        : null;

    const endedResult = Auction.create({
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
      status: AuctionStatus.ENDED,
      antiSnipSeconds: auction.getAntiSnipSeconds(),
      extensionCount: auction.getExtensionCount(),
      maxExtensionCount: auction.getMaxExtensionCount(),
      bidCooldownSeconds: auction.getBidCooldownSeconds(),
      winnerId,
      assets: auction.getAssets(),
    });

    if (endedResult.isFailure) return Result.fail(endedResult.getError());
    const ended = endedResult.getValue();

    const updateResult = await this._auctionRepository.save(ended);
    if (updateResult.isFailure) return Result.fail(updateResult.getError());

    const saved = updateResult.getValue();
    return Result.ok({
      id: saved.getId(),
      status: saved.getStatus(),
    });
  }
}
