import { IAuctionChatMessageRepository } from '@domain/repositories/IAuctionChatMessageRepository';
import { TYPES } from '@di/types.di';
import { inject, injectable } from 'inversify';
import { Result } from '@domain/shared/result';
import type {
  IGetAuctionChatMessagesInput,
  IGetAuctionChatMessagesUsecase,
} from '@application/interfaces/usecases/auction/IGetAuctionChatMessagesUsecase';
import type { IAuctionChatMessageDto } from '@application/interfaces/usecases/auction/ISendAuctionChatMessageUsecase';

@injectable()
export class GetAuctionChatMessagesUsecase implements IGetAuctionChatMessagesUsecase {
  constructor(
    @inject(TYPES.IAuctionChatMessageRepository)
    private readonly _chatRepository: IAuctionChatMessageRepository,
  ) {}

  async execute(
    input: IGetAuctionChatMessagesInput,
  ): Promise<Result<IAuctionChatMessageDto[]>> {
    const result = await this._chatRepository.findManyByAuctionId(
      input.auctionId,
      input.limit,
    );

    if (result.isFailure) return Result.fail(result.getError());

    return Result.ok(
      result.getValue().map((m) => ({
        id: m.getId(),
        auctionId: m.getAuctionId(),
        userId: m.getUserId(),
        userName: m.getUserName(),
        message: m.getMessage(),
        createdAt: m.getCreatedAt().toISOString(),
      })),
    );
  }
}
