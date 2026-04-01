import { TYPES } from '@di/types.di';
import { AuctionWinner } from '@domain/entities/auction/auction-winner.entity';
import { IAuctionWinnerRepository } from '@domain/repositories/IAuctionWinnerRepo';
import { Result } from '@domain/shared/result';
import { AuctionWinnerMapper } from '@infrastructure/mappers/auction/auctionWinner.mapper';
import { PrismaClient } from '@prisma/client';
import { inject } from 'inversify';

export class PrismaAuctionWinnerRepository implements IAuctionWinnerRepository {
    constructor(
        @inject(TYPES.PrismaClient)
        private readonly _prisma: PrismaClient,
    ) {}

    async save(auctionWinner: AuctionWinner): Promise<Result<void>> {
        const data = AuctionWinnerMapper.toPersistence(auctionWinner);

        await this._prisma.auctionWinner.create({
            data,
        });

        return Result.ok();
    }

    async findById(id: string): Promise<Result<AuctionWinner | null>> {
        const result = await this._prisma.auctionWinner.findUnique({
            where: { id },
        });

        if (!result) return Result.ok(null);
        return AuctionWinnerMapper.toDomain(result);
    }

    async findAllByAuctionId(
        auctionId: string,
    ): Promise<Result<AuctionWinner[]>> {
        const result = await this._prisma.auctionWinner.findMany({
            where: { auctionId },
        });

        const winners: AuctionWinner[] = [];
        for (const raw of result) {
            const result = AuctionWinnerMapper.toDomain(raw);
            if (result.isFailure) return Result.fail(result.getError());
            winners.push(result.getValue());
        }

        return Result.ok(winners);
    }

    async findAllByUserId(userId: string): Promise<Result<AuctionWinner[]>> {
        const result = await this._prisma.auctionWinner.findMany({
            where: { userId },
        });

        const winners: AuctionWinner[] = [];
        for (const raw of result) {
            const result = AuctionWinnerMapper.toDomain(raw);
            if (result.isFailure) return Result.fail(result.getError());
            winners.push(result.getValue());
        }

        return Result.ok(winners);
    }
}
