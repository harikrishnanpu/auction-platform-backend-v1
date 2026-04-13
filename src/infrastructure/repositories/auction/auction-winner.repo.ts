import { TYPES } from '@di/types.di';
import { AuctionWinner } from '@domain/entities/auction/auction-winner.entity';
import { IAuctionWinnerRepository } from '@domain/repositories/IAuctionWinnerRepo';
import { Result } from '@domain/shared/result';
import { AuctionWinnerMapper } from '@infrastructure/mappers/auction/auctionWinner.mapper';
import { PrismaClient } from '@prisma/client';
import { inject } from 'inversify';
import { BaseRepository } from '../base/base.Repo';
import { AuctionWinner as PrismaAuctionWinner } from '@prisma/client';
import { IDbMapper } from '@domain/mappers/IDbMapper';

export class PrismaAuctionWinnerRepository
    extends BaseRepository<
        AuctionWinner,
        PrismaAuctionWinner,
        { auctionId: string },
        IDbMapper<AuctionWinner, PrismaAuctionWinner>
    >
    implements IAuctionWinnerRepository
{
    constructor(
        @inject(TYPES.PrismaClient)
        private readonly _prisma: PrismaClient,
        @inject(TYPES.AuctionWinnerMapper)
        readonly mapper: IDbMapper<AuctionWinner, PrismaAuctionWinner>,
    ) {
        super(_prisma.auctionWinner, mapper);
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
