import { TYPES } from '@di/types.di';
import { PublicFallbackAuction } from '@domain/entities/auction/public-fallback-auction.entity';
import { IFallbackAuctionRepo } from '@domain/repositories/IFallbackAuctionRepo';
import { Result } from '@domain/shared/result';
import { PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { BaseRepository } from '../base/base.Repo';
import { PublicFallbackAuction as PrismaPublicFallbackAuction } from '@prisma/client';
import { IDbMapper } from '@domain/mappers/IDbMapper';

@injectable()
export class PrismaFallbackAuctionRepository
    extends BaseRepository<
        PublicFallbackAuction,
        PrismaPublicFallbackAuction,
        { auctionId: string },
        IDbMapper<PublicFallbackAuction, PrismaPublicFallbackAuction>
    >
    implements IFallbackAuctionRepo
{
    constructor(
        @inject(TYPES.PrismaClient)
        private readonly prisma: PrismaClient,
        @inject(TYPES.FallbackPublicAuctionMapper)
        readonly mapper: IDbMapper<
            PublicFallbackAuction,
            PrismaPublicFallbackAuction
        >,
    ) {
        super(prisma.publicFallbackAuction, mapper);
    }

    async findByAuctionId(
        auctionId: string,
    ): Promise<Result<PublicFallbackAuction | null>> {
        const data = await this.prisma.publicFallbackAuction.findUnique({
            where: { auctionId },
        });

        if (!data) return Result.ok(null);
        return this.mapper.toDomain(data);
    }
}
