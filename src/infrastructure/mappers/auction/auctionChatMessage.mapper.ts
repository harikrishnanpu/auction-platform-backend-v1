import { AuctionChatMessage } from '@domain/entities/auction/auction-chat-message.entity';
import { IDbMapper } from '@domain/mappers/IDbMapper';
import { Result } from '@domain/shared/result';
import { AuctionChatMessage as PrismaAuctionChatMessage } from '@prisma/client';

export class AuctionChatMessageMapper implements IDbMapper<
    AuctionChatMessage,
    PrismaAuctionChatMessage
> {
    toDomain(raw: PrismaAuctionChatMessage): Result<AuctionChatMessage> {
        return AuctionChatMessage.create({
            id: raw.id,
            auctionId: raw.auctionId,
            userId: raw.userId,
            userName: raw.userName,
            message: raw.message,
        });
    }

    toPersistence(entity: AuctionChatMessage) {
        return {
            id: entity.getId(),
            auctionId: entity.getAuctionId(),
            userId: entity.getUserId(),
            userName: entity.getUserName(),
            message: entity.getMessage(),
        };
    }
}
