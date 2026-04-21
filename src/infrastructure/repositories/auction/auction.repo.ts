import { TYPES } from '@di/types.di';
import { Auction } from '@domain/entities/auction/auction.entity';
import { IDbMapper } from '@domain/mappers/IDbMapper';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { Result } from '@domain/shared/result';
import {
    IAuctionStatsPublicCounts,
    IFindAllAuctionsFilters,
} from '@domain/types/auctionRepo.types';
import {
    AuctionStatus as PrismaAuctionStatus,
    AuctionType,
    Prisma,
    PrismaClient,
} from '@prisma/client';
import { inject, injectable } from 'inversify';
import {
    Auction as PrismaAuction,
    AuctionAsset as PrismaAuctionAsset,
    AuctionCategory as PrismaAuctionCategory,
} from '@prisma/client';

type PrismaAuctionWithAssets = PrismaAuction & {
    assets: PrismaAuctionAsset[];
    category: PrismaAuctionCategory & { submittedByUser: { name: string } };
};

@injectable()
export class PrismaAuctionRepo implements IAuctionRepository {
    constructor(
        @inject(TYPES.PrismaClient)
        private readonly _prisma: PrismaClient,
        @inject(TYPES.AuctionMapper)
        readonly mapper: IDbMapper<Auction, PrismaAuction>,
    ) {}

    async save(auction: Auction): Promise<Result<Auction>> {
        const data = this.mapper.toPersistence(
            auction,
        ) as PrismaAuctionWithAssets;

        const raw = await this._prisma.auction.upsert({
            where: { id: data.id },
            create: {
                id: data.id,
                sellerId: data.sellerId,
                auctionType: data.auctionType,
                title: data.title,
                description: data.description,
                categoryId: data.categoryId,
                condition: data.condition,
                startPrice: data.startPrice,
                minIncrement: data.minIncrement,
                startAt: data.startAt,
                endAt: data.endAt,
                status: data.status,
                antiSnipSeconds: data.antiSnipSeconds,
                extensionCount: data.extensionCount,
                maxExtensionCount: data.maxExtensionCount,
                bidCooldownSeconds: data.bidCooldownSeconds,
                winnerId: data.winnerId,
                winAmount: data.winAmount,
                assets: {
                    create: data.assets.map((a) => ({
                        id: a.id,
                        fileKey: a.fileKey,
                        position: a.position,
                        assetType: a.assetType,
                    })),
                },
            },
            update: {
                sellerId: data.sellerId,
                auctionType: data.auctionType,
                title: data.title,
                description: data.description,
                categoryId: data.categoryId,
                condition: data.condition,
                startPrice: data.startPrice,
                minIncrement: data.minIncrement,
                startAt: data.startAt,
                endAt: data.endAt,
                status: data.status,
                antiSnipSeconds: data.antiSnipSeconds,
                extensionCount: data.extensionCount,
                maxExtensionCount: data.maxExtensionCount,
                bidCooldownSeconds: data.bidCooldownSeconds,
                winnerId: data.winnerId,
                winAmount: data.winAmount,
                assets: {
                    deleteMany: {},
                    create: data.assets.map((a) => ({
                        id: a.id,
                        fileKey: a.fileKey,
                        position: a.position,
                        assetType: a.assetType,
                    })),
                },
            },

            include: {
                assets: true,
                category: {
                    include: {
                        submittedByUser: true,
                    },
                },
            },
        });

        return this.mapper.toDomain(raw);
    }

    async findById(id: string): Promise<Result<Auction>> {
        const raw = await this._prisma.auction.findUnique({
            where: { id },
            include: {
                assets: true,
                category: {
                    include: {
                        submittedByUser: true,
                    },
                },
            },
        });

        if (!raw) return Result.fail('Auction not found');

        return this.mapper.toDomain(raw);
    }

    async findBySellerId(sellerId: string): Promise<Result<Auction[]>> {
        const list = await this._prisma.auction.findMany({
            where: { sellerId },
            include: {
                assets: true,
                category: {
                    include: {
                        submittedByUser: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const result: Auction[] = [];

        for (const raw of list) {
            const r = this.mapper.toDomain(raw);
            if (r.isFailure) return Result.fail(r.getError());
            result.push(r.getValue());
        }

        return Result.ok(result);
    }

    async findAll(
        filters: IFindAllAuctionsFilters,
    ): Promise<Result<Auction[]>> {
        const where: Prisma.AuctionWhereInput = {};

        if (filters.sellerId) where.sellerId = filters.sellerId;

        if (filters.status && filters.status !== 'ALL') {
            where.status = filters.status as PrismaAuctionStatus;
        }

        if (filters.categoryId && filters.categoryId !== 'ALL') {
            where.categoryId = filters.categoryId;
        }

        if (filters.auctionType && filters.auctionType !== 'ALL') {
            where.auctionType = filters.auctionType as AuctionType;
        }

        if (filters.search?.trim()) {
            const term = filters.search.trim();
            where.OR = [
                { title: { contains: term, mode: 'insensitive' } },
                { description: { contains: term, mode: 'insensitive' } },
            ];
        }

        const sortField = filters.sort ?? 'createdAt';
        const sortOrder = filters.order === 'asc' ? 'asc' : 'desc';

        const list = await this._prisma.auction.findMany({
            where,
            include: {
                assets: true,
                category: {
                    include: {
                        submittedByUser: true,
                    },
                },
            },
            orderBy: [{ [sortField]: sortOrder }, { createdAt: 'desc' }],
            take: filters.limit,
            skip: (filters.page - 1) * filters.limit,
        });

        const result: Auction[] = [];

        for (const raw of list) {
            const r = this.mapper.toDomain(raw);
            if (r.isFailure) return Result.fail(r.getError());
            result.push(r.getValue());
        }

        return Result.ok(result);
    }

    async findAllForUsers(
        filters: IFindAllAuctionsFilters,
    ): Promise<Result<Auction[]>> {
        const safePage = Number(filters.page) > 0 ? Number(filters.page) : 1;
        const safeLimit =
            Number(filters.limit) > 0 ? Number(filters.limit) : 10;

        const where: Prisma.AuctionWhereInput = {};

        where.endAt = {
            gte: new Date(),
        };

        if (filters.status) {
            if (filters.status === 'ALL') {
                where.status = {
                    in: [
                        PrismaAuctionStatus.ACTIVE,
                        PrismaAuctionStatus.PAUSED,
                    ],
                };
            } else {
                where.status = filters.status as PrismaAuctionStatus;
            }
        } else {
            where.status = {
                in: [
                    PrismaAuctionStatus.ACTIVE,
                    PrismaAuctionStatus.PAUSED,
                    PrismaAuctionStatus.ENDED,
                    PrismaAuctionStatus.SOLD,
                    PrismaAuctionStatus.CANCELLED,
                    PrismaAuctionStatus.FALLBACK_ENDED,
                    PrismaAuctionStatus.FALLBACK_PUBLIC_NOTIFICATION,
                    PrismaAuctionStatus.FAILED,
                ],
            };
        }

        if (filters.search?.trim()) {
            const term = filters.search.trim();
            where.OR = [
                { title: { contains: term, mode: 'insensitive' } },
                { description: { contains: term, mode: 'insensitive' } },
            ];
        }

        const sortField = filters.sort ?? 'createdAt';
        const sortOrder = filters.order === 'asc' ? 'asc' : 'desc';

        const list = await this._prisma.auction.findMany({
            where,
            include: {
                assets: true,
                category: {
                    include: { submittedByUser: true },
                },
            },
            orderBy: [{ [sortField]: sortOrder }, { createdAt: 'desc' }],
            skip: (safePage - 1) * safeLimit,
            take: safeLimit,
        });

        const result: Auction[] = [];

        for (const raw of list) {
            const r = this.mapper.toDomain(raw);
            if (r.isFailure) return Result.fail(r.getError());
            result.push(r.getValue());
        }

        return Result.ok(result);
    }

    async findParticipatedByUserId(
        userId: string,
        filters: IFindAllAuctionsFilters,
    ): Promise<Result<{ auctions: Auction[]; total: number }>> {
        const safePage = Number(filters.page) > 0 ? Number(filters.page) : 1;
        const safeLimit =
            Number(filters.limit) > 0 ? Number(filters.limit) : 10;

        const where: Prisma.AuctionWhereInput = {
            participants: {
                some: {
                    userId,
                },
            },
        };

        if (filters.status && filters.status !== 'ALL') {
            where.status = filters.status as PrismaAuctionStatus;
        }

        if (filters.auctionType && filters.auctionType !== 'ALL') {
            where.auctionType = filters.auctionType as AuctionType;
        }

        if (filters.search?.trim()) {
            const term = filters.search.trim();
            where.OR = [
                { title: { contains: term, mode: 'insensitive' } },
                { description: { contains: term, mode: 'insensitive' } },
            ];
        }

        const sortField = filters.sort ?? 'createdAt';
        const sortOrder = filters.order === 'asc' ? 'asc' : 'desc';

        const [rows, total] = await Promise.all([
            this._prisma.auction.findMany({
                where,
                include: {
                    assets: true,
                    category: {
                        include: {
                            submittedByUser: true,
                        },
                    },
                },
                orderBy: [{ [sortField]: sortOrder }, { createdAt: 'desc' }],
                skip: (safePage - 1) * safeLimit,
                take: safeLimit,
            }),
            this._prisma.auction.count({ where }),
        ]);

        const auctions: Auction[] = [];
        for (const raw of rows) {
            const result = this.mapper.toDomain(raw);
            if (result.isFailure) return Result.fail(result.getError());
            auctions.push(result.getValue());
        }

        return Result.ok({ auctions, total });
    }

    async countAuctionStats(): Promise<Result<IAuctionStatsPublicCounts>> {
        try {
            const now = new Date();

            const [liveCount, upcomingCount, endedCount] = await Promise.all([
                this._prisma.auction.count({
                    where: {
                        status: PrismaAuctionStatus.ACTIVE,
                        startAt: { lte: now },
                        endAt: { gte: now },
                    },
                }),
                this._prisma.auction.count({
                    where: {
                        status: {
                            in: [
                                PrismaAuctionStatus.ACTIVE,
                                PrismaAuctionStatus.PAUSED,
                            ],
                        },
                        startAt: { gt: now },
                    },
                }),
                this._prisma.auction.count({
                    where: {
                        status: {
                            in: [
                                PrismaAuctionStatus.ENDED,
                                PrismaAuctionStatus.SOLD,
                                PrismaAuctionStatus.CANCELLED,
                                PrismaAuctionStatus.FALLBACK_ENDED,
                                PrismaAuctionStatus.FALLBACK_PUBLIC_NOTIFICATION,
                            ],
                        },
                    },
                }),
            ]);

            return Result.ok({ liveCount, upcomingCount, endedCount });
        } catch (error) {
            return Result.fail(
                error instanceof Error
                    ? error.message
                    : 'Failed to count public auctions',
            );
        }
    }

    async countParticipatedByUserId(userId: string): Promise<Result<number>> {
        const count = await this._prisma.auction.count({
            where: { participants: { some: { userId: userId } } },
        });
        return Result.ok(count);
    }

    async countAdminVisibleAuctions(): Promise<Result<number>> {
        try {
            const total = await this._prisma.auction.count({
                where: {
                    status: { not: PrismaAuctionStatus.DRAFT },
                },
            });
            return Result.ok(total);
        } catch {
            return Result.fail('Failed to count admin auctions');
        }
    }
}
