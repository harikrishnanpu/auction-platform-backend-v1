import { TYPES } from '@di/types.di';
import { Bid } from '@domain/entities/auction/bid.entity';
import { IBidRepository } from '@domain/repositories/IBidRepository';
import { Result } from '@domain/shared/result';
import { BidMapper } from '@infrastructure/mappers/auction/bid.mapper';
import { PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';

@injectable()
export class PrismaBidRepo implements IBidRepository {
  constructor(
    @inject(TYPES.PrismaClient)
    private readonly _prisma: PrismaClient,
  ) {}

  async create(data: {
    id: string;
    auctionId: string;
    userId: string;
    amount: number;
  }): Promise<Result<Bid>> {
    const row = await this._prisma.bid.create({
      data: {
        id: data.id,
        auctionId: data.auctionId,
        userId: data.userId,
        amount: data.amount,
      },
    });

    return BidMapper.toDomain(row);
  }

  async findLatestByAuctionId(auctionId: string): Promise<Result<Bid | null>> {
    const row = await this._prisma.bid.findFirst({
      where: { auctionId },
      orderBy: { amount: 'desc' },
    });

    if (!row) return Result.ok(null);
    return BidMapper.toDomain(row);
  }

  async findLastBidTimeByUser(
    auctionId: string,
    userId: string,
  ): Promise<Result<Date | null>> {
    const row = await this._prisma.bid.findFirst({
      where: { auctionId, userId },
      orderBy: { createdAt: 'desc' },
    });
    return Result.ok(row?.createdAt ?? null);
  }

  async findManyByAuctionId(
    auctionId: string,
    limit: number,
  ): Promise<Result<Bid[]>> {
    const rows = await this._prisma.bid.findMany({
      where: { auctionId },
      orderBy: { amount: 'desc' },
      take: limit,
    });

    const bids: Bid[] = [];
    for (const row of rows) {
      const result = BidMapper.toDomain(row);

      if (result.isFailure) return Result.fail<Bid[]>(result.getError());
      bids.push(result.getValue());
    }
    return Result.ok(bids);
  }
}
