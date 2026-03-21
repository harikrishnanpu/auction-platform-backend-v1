import { AuctionChatMessage } from '@domain/entities/auction/auction-chat-message.entity';
import { Result } from '@domain/shared/result';

export interface IAuctionChatMessageRepository {
  create(data: {
    id: string;
    auctionId: string;
    userId: string;
    userName: string;
    message: string;
  }): Promise<Result<AuctionChatMessage>>;

  findManyByAuctionId(
    auctionId: string,
    limit: number,
  ): Promise<Result<AuctionChatMessage[]>>;
}
