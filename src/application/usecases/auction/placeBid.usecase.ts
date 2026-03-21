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
import { IBidLockService } from '@application/interfaces/services/IBidLockService';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { Auction } from '@domain/entities/auction/auction.entity';

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
    @inject(TYPES.IBidLockService)
    private readonly _bidLockService: IBidLockService,
  ) {}

  async execute(input: IPlaceBidInput): Promise<Result<IPlaceBidOutput>> {
    const lockKey = this._bidLockService.lockKeyForAuction(input.auctionId);
    const lockTtlSeconds = 5;
    const lockToken = this._idGeneratingService.generateId();

    const locked = await this._bidLockService.lock(
      lockKey,
      lockToken,
      lockTtlSeconds,
    );

    if (!locked) {
      return Result.fail('Bid is being processed, try again');
    }

    try {
      const auctionResult = await this._auctionRepo.findById(input.auctionId);

      if (auctionResult.isFailure) {
        return Result.fail(auctionResult.getError());
      }

      const auction = auctionResult.getValue();

      if (auction.getStatus() !== AuctionStatus.ACTIVE) {
        return Result.fail(AUCTION_MESSAGES.AUCTION_NOT_ACTIVE);
      }

      if (auction.getEndAt().getTime() <= Date.now()) {
        return Result.fail(AUCTION_MESSAGES.AUCTION_ENDED);
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

      const nowMs = Date.now();
      const remainingSec = (auction.getEndAt().getTime() - nowMs) / 1000;
      const currentExtensionCount = auction.getExtensionCount();
      const maxExtensionCount = auction.getMaxExtensionCount();

      const shouldExtend =
        remainingSec <= auction.getAntiSnipSeconds() &&
        currentExtensionCount < maxExtensionCount;

      let effectiveEndAt = auction.getEndAt().toISOString();
      let effectiveExtensionCount = currentExtensionCount;

      if (shouldExtend) {
        const extendedEndAt = new Date(
          auction.getEndAt().getTime() + auction.getAntiSnipSeconds() * 1000,
        );

        const updatedAuctionRes = Auction.create({
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
          endAt: extendedEndAt,
          antiSnipSeconds: auction.getAntiSnipSeconds(),
          extensionCount: currentExtensionCount + 1,
          maxExtensionCount: auction.getMaxExtensionCount(),
          bidCooldownSeconds: auction.getBidCooldownSeconds(),
          status: auction.getStatus(),
          winnerId: auction.getWinnerId(),
          assets: auction.getAssets(),
        });

        if (updatedAuctionRes.isFailure) {
          return Result.fail(updatedAuctionRes.getError());
        }

        const updatedAuction = updatedAuctionRes.getValue();
        const saveRes = await this._auctionRepo.save(updatedAuction);
        if (saveRes.isFailure) {
          return Result.fail(saveRes.getError());
        }

        effectiveEndAt = saveRes.getValue().getEndAt().toISOString();
        effectiveExtensionCount = saveRes.getValue().getExtensionCount();
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
        endAt: effectiveEndAt,
        extensionCount: effectiveExtensionCount,
      };

      return Result.ok(output);
    } finally {
      await this._bidLockService.release(lockKey, lockToken);
    }
  }
}
