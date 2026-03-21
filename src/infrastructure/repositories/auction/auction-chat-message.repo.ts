import { TYPES } from '@di/types.di';
import { AuctionChatMessage } from '@domain/entities/auction/auction-chat-message.entity';
import { IAuctionChatMessageRepository } from '@domain/repositories/IAuctionChatMessageRepository';
import { Result } from '@domain/shared/result';
import { PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';

@injectable()
export class PrismaAuctionChatMessageRepo implements IAuctionChatMessageRepository {
  constructor(
    @inject(TYPES.PrismaClient)
    private readonly _prisma: PrismaClient,
  ) {}

  async create(data: {
    id: string;
    auctionId: string;
    userId: string;
    userName: string;
    message: string;
  }): Promise<Result<AuctionChatMessage>> {
    const row = await this._prisma.auctionChatMessage.create({
      data: {
        id: data.id,
        auctionId: data.auctionId,
        userId: data.userId,
        userName: data.userName,
        message: data.message,
      },
    });

    const created = AuctionChatMessage.create({
      id: row.id,
      auctionId: row.auctionId,
      userId: row.userId,
      userName: row.userName,
      message: row.message,
      createdAt: row.createdAt,
    });

    if (created.isFailure) return Result.fail(created.getError());
    return Result.ok(created.getValue());
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
      const created = AuctionChatMessage.create({
        id: row.id,
        auctionId: row.auctionId,
        userId: row.userId,
        userName: row.userName,
        message: row.message,
        createdAt: row.createdAt,
      });
      if (created.isFailure) return Result.fail(created.getError());
      messages.push(created.getValue());
    }

    return Result.ok(messages);
  }
}
