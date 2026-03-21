import { Result } from '@domain/shared/result';

export interface ISendAuctionChatMessageInput {
  auctionId: string;
  userId: string;
  userName: string;
  message: string;
}

export interface IAuctionChatMessageDto {
  id: string;
  auctionId: string;
  userId: string;
  userName: string;
  message: string;
  createdAt: string;
}

export interface ISendAuctionChatMessageUsecase {
  execute(
    input: ISendAuctionChatMessageInput,
  ): Promise<Result<IAuctionChatMessageDto>>;
}
