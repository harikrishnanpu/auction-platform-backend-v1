import { TYPES } from '@di/types.di';
import { AuctionParticipant } from '@domain/entities/auction/auction-participant.entity';
import { IAuctionParticipantRepository } from '@domain/repositories/IAuctionParticipantRepository';
import { Result } from '@domain/shared/result';
import { AuctionParticipantMapper } from '@infrastructure/mappers/auction/auction-particpants.mapper';
import { PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';

@injectable()
export class PrismaAuctionParticipantRepo implements IAuctionParticipantRepository {
    constructor(
        @inject(TYPES.PrismaClient)
        private readonly _prisma: PrismaClient,
    ) {}

    async save(data: AuctionParticipant): Promise<Result<AuctionParticipant>> {
        const res = await this._prisma.auctionParticipant.upsert({
            where: {
                auctionId_userId: {
                    auctionId: data.getAuctionId(),
                    userId: data.getUserId(),
                },
            },
            create: {
                auctionId: data.getAuctionId(),
                userId: data.getUserId(),
                userName: data.getUserName(),
                intialAmount: data.getIntialAmount(),
            },
            update: {
                userName: data.getUserName(),
                intialAmount: data.getIntialAmount(),
            },
        });

        return AuctionParticipantMapper.toDomain(res);
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
            const result = AuctionParticipantMapper.toDomain(row);
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
            const result = AuctionParticipantMapper.toDomain(row);
            if (result.isFailure)
                return Result.fail<AuctionParticipant[]>(result.getError());
            participants.push(result.getValue());
        }

        return Result.ok(participants);
    }
}
