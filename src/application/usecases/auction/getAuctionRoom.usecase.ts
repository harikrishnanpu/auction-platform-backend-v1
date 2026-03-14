import { AUCTION_MESSAGES } from '@application/constants/auction/auction.constants';
import {
  IGetAuctionRoomInput,
  IGetAuctionRoomOutput,
} from '@application/dtos/auction/get-auction-room.dto';
import { IGetAuctionRoomUsecase } from '@application/interfaces/usecases/auction/IGetAuctionRoomUsecase';
import { TYPES } from '@di/types.di';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { IBidRepository } from '@domain/repositories/IBidRepository';
import { IAuctionParticipantRepository } from '@domain/repositories/IAuctionParticipantRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';
import { AuctionStatus } from '@domain/entities/auction/auction.entity';

@injectable()
export class GetAuctionRoomUsecase implements IGetAuctionRoomUsecase {
  constructor(
    @inject(TYPES.IAuctionRepository)
    private readonly _auctionRepo: IAuctionRepository,
    @inject(TYPES.IBidRepository)
    private readonly _bidRepo: IBidRepository,
    @inject(TYPES.IAuctionParticipantRepository)
    private readonly _participantRepo: IAuctionParticipantRepository,
  ) {}

  async execute(
    input: IGetAuctionRoomInput,
  ): Promise<Result<IGetAuctionRoomOutput>> {
    const auctionResult = await this._auctionRepo.findById(input.auctionId);

    if (auctionResult.isFailure) {
      return Result.fail(auctionResult.getError());
    }

    const auction = auctionResult.getValue();
    const isSellerViewingOwn =
      input.sellerId && auction.getSellerId() === input.sellerId;

    if (!isSellerViewingOwn) {
      if (auction.getStatus() === AuctionStatus.DRAFT) {
        return Result.fail(AUCTION_MESSAGES.AUCTION_NOT_ACTIVE);
      }
      if (
        auction.getStatus() === AuctionStatus.ENDED ||
        auction.getStatus() === AuctionStatus.CANCELLED
      ) {
        return Result.fail(AUCTION_MESSAGES.AUCTION_ENDED);
      }
      if (auction.getStartAt() > new Date()) {
        return Result.fail(AUCTION_MESSAGES.AUCTION_NOT_STARTED);
      }
      if (auction.getEndAt() < new Date()) {
        return Result.fail(AUCTION_MESSAGES.AUCTION_ENDED);
      }
    }

    const [bidsResult, participantsResult] = await Promise.all([
      this._bidRepo.findManyByAuctionId(input.auctionId, 500),
      this._participantRepo.findByAuctionId(input.auctionId),
    ]);

    if (bidsResult.isFailure) {
      return Result.fail(bidsResult.getError());
    }

    if (participantsResult.isFailure) {
      return Result.fail(participantsResult.getError());
    }

    const bids = bidsResult.getValue();
    const participants = participantsResult.getValue();

    const byTime = [...bids].sort(
      (a, b) => b.getCreatedAt().getTime() - a.getCreatedAt().getTime(),
    );

    const lastBidTime = byTime[0]?.getCreatedAt();

    const output: IGetAuctionRoomOutput = {
      bids: byTime.map((b) => ({
        id: b.getId(),
        auctionId: b.getAuctionId(),
        userId: b.getUserId(),
        amount: b.getAmount(),
        createdAt: b.getCreatedAt().toISOString(),
      })),

      participants: participants.map((p) => ({
        id: p.getId(),
        auctionId: p.getAuctionId(),
        userId: p.getUserId(),
        userName: p.getUserName(),
        joinedAt: p.getJoinedAt().toISOString(),
      })),

      lastBidTime: lastBidTime ? lastBidTime.toISOString() : null,
    };
    return Result.ok(output);
  }
}
