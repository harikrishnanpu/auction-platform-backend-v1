import { TYPES } from '@di/types.di';
import { PublicAuctionFallbackParticipants } from '@domain/entities/auction/public-auction-fallback-participants.entity';
import { IFallbackAuctionParticipantsRepo } from '@domain/repositories/IFallbackAuctionParticipantsRepo';
import { Result } from '@domain/shared/result';
import { FallbackAuctionParticipantsMapper } from '@infrastructure/mappers/auction/fallbackAuctionParticipants.mapper';
import { PrismaClient } from '@prisma/client';
import { inject } from 'inversify';

export class PrismaFallbackAuctionParticipantsRepo implements IFallbackAuctionParticipantsRepo {
    constructor(
        @inject(TYPES.PrismaClient)
        private readonly prisma: PrismaClient,
    ) {}

    async save(
        publicAuctionFallbackParticipants: PublicAuctionFallbackParticipants,
    ): Promise<Result<void>> {
        const data = FallbackAuctionParticipantsMapper.toPersistence(
            publicAuctionFallbackParticipants,
        );

        await this.prisma.publicFallbackAuctionParticipants.upsert({
            where: { id: publicAuctionFallbackParticipants.getId() },
            update: data,
            create: data,
        });

        return Result.ok();
    }

    async findByAuctionIdAndUserId(
        auctionId: string,
        userId: string,
    ): Promise<Result<PublicAuctionFallbackParticipants | null>> {
        const data =
            await this.prisma.publicFallbackAuctionParticipants.findUnique({
                where: {
                    publicFallbackAuctionId_userId: {
                        publicFallbackAuctionId: auctionId,
                        userId: userId,
                    },
                },
            });

        if (!data) return Result.ok(null);
        return FallbackAuctionParticipantsMapper.toDomain(data);
    }

    async findByAuctionId(
        auctionId: string,
    ): Promise<Result<PublicAuctionFallbackParticipants[]>> {
        const data =
            await this.prisma.publicFallbackAuctionParticipants.findMany({
                where: { publicFallbackAuctionId: auctionId },
            });

        return Result.ok(
            data
                .map(FallbackAuctionParticipantsMapper.toDomain)
                .map((result) => result.getValue()),
        );
    }
}
