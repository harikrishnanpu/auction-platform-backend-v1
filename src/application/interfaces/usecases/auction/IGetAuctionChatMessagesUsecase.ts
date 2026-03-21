import { Result } from '@domain/shared/result';
import type { IAuctionChatMessageDto } from '@application/interfaces/usecases/auction/ISendAuctionChatMessageUsecase';

export interface IGetAuctionChatMessagesInput {
  auctionId: string;
  limit: number;
}

export interface IGetAuctionChatMessagesUsecase {
  execute(
    input: IGetAuctionChatMessagesInput,
  ): Promise<Result<IAuctionChatMessageDto[]>>;
}
