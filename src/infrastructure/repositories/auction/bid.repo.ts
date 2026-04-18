import { TYPES } from '@di/types.di';
import { Bid } from '@domain/entities/auction/bid.entity';
import { IBidRepository } from '@domain/repositories/IBidRepository';
import { Result } from '@domain/shared/result';
import { PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { BaseRepository } from '../base/base.Repo';
import { Bid as PrismaBid } from '@prisma/client';
import { IDbMapper } from '@domain/mappers/IDbMapper';

@injectable()
export class PrismaBidRepo
    extends BaseRepository<
        Bid,
        PrismaBid,
        { auctionId: string },
        IDbMapper<Bid, PrismaBid>
    >
    implements IBidRepository
{
    constructor(
        @inject(TYPES.PrismaClient)
        private readonly _prisma: PrismaClient,
        @inject(TYPES.BidMapper)
        readonly mapper: IDbMapper<Bid, PrismaBid>,
    ) {
        super(_prisma.bid, mapper);
    }

    async findLatestByAuctionId(
        auctionId: string,
    ): Promise<Result<Bid | null>> {
        const row = await this._prisma.bid.findFirst({
            where: { auctionId },
            orderBy: { amount: 'desc' },
        });

        if (!row) return Result.ok(null);
        return this.mapper.toDomain(row);
    }

    async findLastBidsByUser(
        auctionId: string,
        userId: string,
    ): Promise<Result<Bid | null>> {
        const res = await this._prisma.bid.findFirst({
            where: {
                auctionId,
                userId,
            },
            orderBy: { createdAt: 'desc' },
        });

        if (!res) return Result.ok(null);

        return this.mapper.toDomain(res);
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
            const result = this.mapper.toDomain(row);

            if (result.isFailure) return Result.fail<Bid[]>(result.getError());
            bids.push(result.getValue());
        }
        return Result.ok(bids);
    }

    async findAllByAuctionId(auctionId: string): Promise<Result<Bid[]>> {
        const result = await this._prisma.bid.findMany({
            where: { auctionId },
            orderBy: { createdAt: 'desc' },
        });

        const bids: Bid[] = [];
        for (const row of result) {
            const result = this.mapper.toDomain(row);
            if (result.isFailure) return Result.fail(result.getError());
            bids.push(result.getValue());
        }

        return Result.ok(bids);
    }
}
