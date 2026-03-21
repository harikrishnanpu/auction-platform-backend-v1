import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { IAuctionChatMessageRepository } from '@domain/repositories/IAuctionChatMessageRepository';
import { AuctionStatus } from '@domain/entities/auction/auction.entity';
import { TYPES } from '@di/types.di';
import { inject, injectable } from 'inversify';
import { Result } from '@domain/shared/result';
import type {
  IAuctionChatMessageDto,
  ISendAuctionChatMessageInput,
  ISendAuctionChatMessageUsecase,
} from '@application/interfaces/usecases/auction/ISendAuctionChatMessageUsecase';
import type { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';

@injectable()
export class SendAuctionChatMessageUsecase implements ISendAuctionChatMessageUsecase {
  constructor(
    @inject(TYPES.IAuctionRepository)
    private readonly _auctionRepository: IAuctionRepository,
    @inject(TYPES.IAuctionChatMessageRepository)
    private readonly _chatRepository: IAuctionChatMessageRepository,
    @inject(TYPES.IIdGeneratingService)
    private readonly _idGeneratingService: IIdGeneratingService,
  ) {}

  async execute(
    input: ISendAuctionChatMessageInput,
  ): Promise<Result<IAuctionChatMessageDto>> {
    const auctionResult = await this._auctionRepository.findById(
      input.auctionId,
    );
    if (auctionResult.isFailure) return Result.fail(auctionResult.getError());
    const auction = auctionResult.getValue();

    if (auction.getStatus() === AuctionStatus.DRAFT) {
      return Result.fail('Cannot send chat for draft auctions');
    }

    const messageId = this._idGeneratingService.generateId();

    const created = await this._chatRepository.create({
      id: messageId,
      auctionId: input.auctionId,
      userId: input.userId,
      userName: input.userName,
      message: input.message,
    });

    if (created.isFailure) return Result.fail(created.getError());

    const msg = created.getValue();

    return Result.ok({
      id: msg.getId(),
      auctionId: msg.getAuctionId(),
      userId: msg.getUserId(),
      userName: msg.getUserName(),
      message: msg.getMessage(),
      createdAt: msg.getCreatedAt().toISOString(),
    });
  }
}
