import { TYPES } from '@di/types.di';
import { PublicAuctionFallbackParticipants } from '@domain/entities/auction/public-auction-fallback-participants.entity';
import { IFallbackAuctionParticipantsRepo } from '@domain/repositories/IFallbackAuctionParticipantsRepo';
import { Result } from '@domain/shared/result';
import { PrismaClient } from '@prisma/client';
import { inject } from 'inversify';
import { BaseRepository } from '../base/base.Repo';
import { PublicFallbackAuctionParticipants as PrismaPublicFallbackAuctionParticipants } from '@prisma/client';
import { IDbMapper } from '@domain/mappers/IDbMapper';

export class PrismaFallbackAuctionParticipantsRepo
    extends BaseRepository<
        PublicAuctionFallbackParticipants,
        PrismaPublicFallbackAuctionParticipants,
        { publicFallbackAuctionId: string },
        IDbMapper<
            PublicAuctionFallbackParticipants,
            PrismaPublicFallbackAuctionParticipants
        >
    >
    implements IFallbackAuctionParticipantsRepo
{
    constructor(
        @inject(TYPES.PrismaClient)
        private readonly _prisma: PrismaClient,
        @inject(TYPES.FallbackAuctionParticipantsMapper)
        readonly mapper: IDbMapper<
            PublicAuctionFallbackParticipants,
            PrismaPublicFallbackAuctionParticipants
        >,
    ) {
        super(_prisma.publicFallbackAuctionParticipants, mapper);
    }

    async findByAuctionIdAndUserId(
        auctionId: string,
        userId: string,
    ): Promise<Result<PublicAuctionFallbackParticipants | null>> {
        const data =
            await this._prisma.publicFallbackAuctionParticipants.findUnique({
                where: {
                    publicFallbackAuctionId_userId: {
                        publicFallbackAuctionId: auctionId,
                        userId: userId,
                    },
                },
            });

        if (!data) return Result.ok(null);
        return this.mapper.toDomain(data);
    }

    async findByAuctionId(
        auctionId: string,
    ): Promise<Result<PublicAuctionFallbackParticipants[]>> {
        const data =
            await this._prisma.publicFallbackAuctionParticipants.findMany({
                where: { publicFallbackAuctionId: auctionId },
            });

        return Result.ok(
            data.map(this.mapper.toDomain).map((result) => result.getValue()),
        );
    }
}
