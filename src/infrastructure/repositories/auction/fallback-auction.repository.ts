import { TYPES } from '@di/types.di';
import { PublicFallbackAuction } from '@domain/entities/auction/public-fallback-auction.entity';
import { IFallbackAuctionRepo } from '@domain/repositories/IFallbackAuctionRepo';
import { Result } from '@domain/shared/result';
import { FallbackPublicAuctionMapper } from '@infrastructure/mappers/auction/fallbackPublicAuction.mapper';
import { PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';

@injectable()
export class PrismaFallbackAuctionRepository implements IFallbackAuctionRepo {
    constructor(
        @inject(TYPES.PrismaClient)
        private readonly prisma: PrismaClient,
    ) {}

    async save(
        publicFallbackAuction: PublicFallbackAuction,
    ): Promise<Result<void>> {
        const data = FallbackPublicAuctionMapper.toPersistence(
            publicFallbackAuction,
        ).getValue();

        await this.prisma.publicFallbackAuction.upsert({
            where: {
                auctionId: publicFallbackAuction.getAuctionId(),
            },
            create: {
                ...data,
            },
            update: {
                ...data,
            },
        });

        return Result.ok();
    }

    async findById(id: string): Promise<Result<PublicFallbackAuction | null>> {
        const data = await this.prisma.publicFallbackAuction.findUnique({
            where: { id },
        });

        if (!data) return Result.ok(null);
        return FallbackPublicAuctionMapper.toDomain(data);
    }

    async findByAuctionId(
        auctionId: string,
    ): Promise<Result<PublicFallbackAuction | null>> {
        const data = await this.prisma.publicFallbackAuction.findUnique({
            where: { auctionId },
        });

        if (!data) return Result.ok(null);
        return FallbackPublicAuctionMapper.toDomain(data);
    }
}
