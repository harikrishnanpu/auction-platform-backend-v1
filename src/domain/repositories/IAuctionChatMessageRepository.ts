import { AuctionChatMessage } from '@domain/entities/auction/auction-chat-message.entity';
import { Result } from '@domain/shared/result';

export interface IAuctionChatMessageRepository {
    create(data: AuctionChatMessage): Promise<Result<void>>;

    findManyByAuctionId(
        auctionId: string,
        limit: number,
    ): Promise<Result<AuctionChatMessage[]>>;
}
