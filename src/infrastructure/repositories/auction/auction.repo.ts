import { TYPES } from '@di/types.di';
import { Auction } from '@domain/entities/auction/auction.entity';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { Result } from '@domain/shared/result';
import { IFindAllAuctionsFilters } from '@domain/types/auctionRepo.types';
import { AuctionMapper } from '@infrastructure/mappers/auction/auction.mapper';
import {
    AuctionStatus as PrismaAuctionStatus,
    AuctionType,
    Prisma,
    PrismaClient,
} from '@prisma/client';
import { inject, injectable } from 'inversify';

@injectable()
export class PrismaAuctionRepo implements IAuctionRepository {
    constructor(
        @inject(TYPES.PrismaClient)
        private readonly _prisma: PrismaClient,
    ) {}

    async save(auction: Auction): Promise<Result<Auction>> {
        const data = AuctionMapper.toPersistence(auction);

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

            include: { assets: true, category: true },
        });

        return AuctionMapper.toDomain(raw);
    }

    async findById(id: string): Promise<Result<Auction>> {
        const raw = await this._prisma.auction.findUnique({
            where: { id },
            include: { assets: true, category: true },
        });

        if (!raw) return Result.fail('Auction not found');

        return AuctionMapper.toDomain(raw);
    }

    async findBySellerId(sellerId: string): Promise<Result<Auction[]>> {
        const list = await this._prisma.auction.findMany({
            where: { sellerId },
            include: { assets: true, category: true },
            orderBy: { createdAt: 'desc' },
        });

        const result: Auction[] = [];

        for (const raw of list) {
            const r = AuctionMapper.toDomain(raw);
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
            include: { assets: true, category: true },
            orderBy: [{ [sortField]: sortOrder }, { createdAt: 'desc' }],
        });

        const result: Auction[] = [];

        for (const raw of list) {
            const r = AuctionMapper.toDomain(raw);
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
                include: { assets: true, category: true },
                orderBy: [{ [sortField]: sortOrder }, { createdAt: 'desc' }],
                skip: (safePage - 1) * safeLimit,
                take: safeLimit,
            }),
            this._prisma.auction.count({ where }),
        ]);

        const auctions: Auction[] = [];
        for (const raw of rows) {
            const result = AuctionMapper.toDomain(raw);
            if (result.isFailure) return Result.fail(result.getError());
            auctions.push(result.getValue());
        }

        return Result.ok({ auctions, total });
    }
}
