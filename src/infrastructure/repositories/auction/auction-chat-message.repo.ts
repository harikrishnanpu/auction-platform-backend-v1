import { TYPES } from '@di/types.di';
import { AuctionChatMessage } from '@domain/entities/auction/auction-chat-message.entity';
import { IAuctionChatMessageRepository } from '@domain/repositories/IAuctionChatMessageRepository';
import { Result } from '@domain/shared/result';
import { PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { AuctionChatMessage as PrismaAuctionChatMessage } from '@prisma/client';
import { BaseRepository } from '../base/base.Repo';
import { IDbMapper } from '@domain/mappers/IDbMapper';

@injectable()
export class PrismaAuctionChatMessageRepo
    extends BaseRepository<
        AuctionChatMessage,
        PrismaAuctionChatMessage,
        { auctionId: string },
        IDbMapper<AuctionChatMessage, PrismaAuctionChatMessage>
    >
    implements IAuctionChatMessageRepository
{
    constructor(
        @inject(TYPES.PrismaClient)
        private readonly _prisma: PrismaClient,
        @inject(TYPES.AuctionChatMessageMapper)
        readonly mapper: IDbMapper<
            AuctionChatMessage,
            PrismaAuctionChatMessage
        >,
    ) {
        super(_prisma.auctionChatMessage, mapper);
    }

    async findManyByAuctionId(
        auctionId: string,
        limit: number,
    ): Promise<Result<AuctionChatMessage[]>> {
        const rows = await this._prisma.auctionChatMessage.findMany({
            where: { auctionId },
            orderBy: { createdAt: 'asc' },
            take: limit,
        });

        const messages: AuctionChatMessage[] = [];

        for (const row of rows) {
            const created = this.mapper.toDomain(row);
            if (created.isFailure) return Result.fail(created.getError());
            messages.push(created.getValue());
        }

        return Result.ok(messages);
    }
}
