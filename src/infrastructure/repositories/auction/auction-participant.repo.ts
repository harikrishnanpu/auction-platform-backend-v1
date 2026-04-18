import { TYPES } from '@di/types.di';
import { AuctionParticipant } from '@domain/entities/auction/auction-participant.entity';
import { IAuctionParticipantRepository } from '@domain/repositories/IAuctionParticipantRepository';
import { Result } from '@domain/shared/result';
import { PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { BaseRepository } from '../base/base.Repo';
import { AuctionParticipant as PrismaAuctionParticipant } from '@prisma/client';
import { IDbMapper } from '@domain/mappers/IDbMapper';

@injectable()
export class PrismaAuctionParticipantRepo
    extends BaseRepository<
        AuctionParticipant,
        PrismaAuctionParticipant,
        { id: string },
        IDbMapper<AuctionParticipant, PrismaAuctionParticipant>
    >
    implements IAuctionParticipantRepository
{
    constructor(
        @inject(TYPES.PrismaClient)
        private readonly _prisma: PrismaClient,
        @inject(TYPES.AuctionParticipantMapper)
        mapper: IDbMapper<AuctionParticipant, PrismaAuctionParticipant>,
    ) {
        super(_prisma.auctionParticipant, mapper);
    }

    async findByAuctionId(
        auctionId: string,
    ): Promise<Result<AuctionParticipant[]>> {
        const rows = await this._prisma.auctionParticipant.findMany({
            where: { auctionId },
            orderBy: { joinedAt: 'asc' },
        });

        const participants: AuctionParticipant[] = [];

        for (const row of rows) {
            const result = this.mapper.toDomain(row);
            if (result.isFailure)
                return Result.fail<AuctionParticipant[]>(result.getError());
            participants.push(result.getValue());
        }

        return Result.ok(participants);
    }

    async findByUserId(userId: string): Promise<Result<AuctionParticipant[]>> {
        const rows = await this._prisma.auctionParticipant.findMany({
            where: { userId },
            orderBy: { joinedAt: 'desc' },
        });

        const participants: AuctionParticipant[] = [];

        for (const row of rows) {
            const result = this.mapper.toDomain(row);
            if (result.isFailure)
                return Result.fail<AuctionParticipant[]>(result.getError());
            participants.push(result.getValue());
        }

        return Result.ok(participants);
    }
}
