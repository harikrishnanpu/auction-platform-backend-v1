import { AUCTION_MESSAGES } from '@application/constants/auction/auction.constants';
import {
  IPlaceBidInput,
  IPlaceBidOutput,
} from '@application/dtos/auction/place-bid.dto';
import { IPlaceBidUsecase } from '@application/interfaces/usecases/auction/IPlaceBidUsecase';
import { TYPES } from '@di/types.di';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { IBidRepository } from '@domain/repositories/IBidRepository';
import { IAuctionParticipantRepository } from '@domain/repositories/IAuctionParticipantRepository';
import { AuctionStatus } from '@domain/entities/auction/auction.entity';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';

@injectable()
export class PlaceBidUsecase implements IPlaceBidUsecase {
  constructor(
    @inject(TYPES.IAuctionRepository)
    private readonly _auctionRepo: IAuctionRepository,
    @inject(TYPES.IBidRepository)
    private readonly _bidRepo: IBidRepository,
    @inject(TYPES.IAuctionParticipantRepository)
    private readonly _participantRepo: IAuctionParticipantRepository,
    @inject(TYPES.IIdGeneratingService)
    private readonly _idGeneratingService: IIdGeneratingService,
  ) {}

  async execute(input: IPlaceBidInput): Promise<Result<IPlaceBidOutput>> {
    const auctionResult = await this._auctionRepo.findById(input.auctionId);

    if (auctionResult.isFailure) {
      return Result.fail(auctionResult.getError());
    }
    const auction = auctionResult.getValue();

    if (auction.getStatus() !== AuctionStatus.ACTIVE) {
      return Result.fail(AUCTION_MESSAGES.AUCTION_NOT_ACTIVE);
    }

    if (auction.getSellerId() === input.userId) {
      return Result.fail(AUCTION_MESSAGES.SELLER_CANNOT_PLACE_BID);
    }

    const latestResult = await this._bidRepo.findLatestByAuctionId(
      input.auctionId,
    );

    if (latestResult.isFailure) return Result.fail(latestResult.getError());

    const latest = latestResult.getValue();

    if (latest !== null) {
      if (latest.getAmount() >= input.amount) {
        return Result.fail(AUCTION_MESSAGES.BID_BELOW_LATEST);
      }
    }

    const currentMin =
      latest !== null
        ? latest.getAmount() + auction.getMinIncrement()
        : auction.getStartPrice();

    if (input.amount < currentMin) {
      return Result.fail(
        AUCTION_MESSAGES.BID_BELOW_MIN(currentMin, auction.getMinIncrement()),
      );
    }

    const lastBidResult = await this._bidRepo.findLastBidTimeByUser(
      input.auctionId,
      input.userId,
    );

    if (lastBidResult.isFailure) return Result.fail(lastBidResult.getError());

    const lastBidTime = lastBidResult.getValue();

    if (lastBidTime) {
      const elapsedSec = (Date.now() - lastBidTime.getTime()) / 1000;
      if (elapsedSec < auction.getBidCooldownSeconds())
        return Result.fail(
          AUCTION_MESSAGES.COOLDOWN_WAIT(
            Math.ceil(auction.getBidCooldownSeconds() - elapsedSec),
          ),
        );
    }

    const participantResult = await this._participantRepo.save({
      auctionId: input.auctionId,
      userId: input.userId,
      userName: input.userName,
    });

    if (participantResult.isFailure) {
      return Result.fail(participantResult.getError());
    }

    const bidId = this._idGeneratingService.generateId();

    const createResult = await this._bidRepo.create({
      id: bidId,
      auctionId: input.auctionId,
      userId: input.userId,
      amount: input.amount,
    });

    if (createResult.isFailure) {
      return Result.fail(createResult.getError());
    }

    const bid = createResult.getValue();

    const output: IPlaceBidOutput = {
      id: bid.getId(),
      auctionId: bid.getAuctionId(),
      userId: bid.getUserId(),
      amount: bid.getAmount(),
      createdAt: bid.getCreatedAt().toISOString(),
    };

    return Result.ok(output);
  }
}
