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

    async create(data: Bid): Promise<Result<Bid>> {
        const row = await this._prisma.bid.create({
            data: {
                id: data.getId(),
                auctionId: data.getAuctionId(),
                userId: data.getUserId(),
                amount: data.getAmount(),
                encryptedAmount: data.getEncryptedAmount(),
            },
        });

        return BidMapper.toDomain(row);
    }

    async findLatestByAuctionId(
        auctionId: string,
    ): Promise<Result<Bid | null>> {
        const row = await this._prisma.bid.findFirst({
            where: { auctionId },
            orderBy: { amount: 'desc' },
        });

        if (!row) return Result.ok(null);
        return BidMapper.toDomain(row);
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

        return BidMapper.toDomain(res);
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

    async findAllByAuctionId(auctionId: string): Promise<Result<Bid[]>> {
        const result = await this._prisma.bid.findMany({
            where: { auctionId },
            orderBy: { createdAt: 'desc' },
        });

        const bids: Bid[] = [];
        for (const row of result) {
            const result = BidMapper.toDomain(row);
            if (result.isFailure) return Result.fail(result.getError());
            bids.push(result.getValue());
        }

        return Result.ok(bids);
    }
}
