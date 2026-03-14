import { TYPES } from '@di/types.di';
import { Auction } from '@domain/entities/auction/auction.entity';
import {
  IAuctionRepository,
  IFindForBrowseFilters,
} from '@domain/repositories/IAuctionRepository';
import { Result } from '@domain/shared/result';
import {
  AuctionMapper,
  PrismaAuctionWithAssets,
} from '@infrastructure/mappers/auction/auction.mapper';
import { AuctionType, PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';

@injectable()
export class PrismaAuctionRepo implements IAuctionRepository {
  constructor(
    @inject(TYPES.PrismaClient)
    private readonly _prisma: PrismaClient,
  ) {}

  async save(auction: Auction): Promise<Result<Auction>> {
    const data = AuctionMapper.toPersistence(auction);

    await this._prisma.auction.create({
      data: {
        id: data.id,
        sellerId: data.sellerId,
        auctionType: data.auctionType,
        title: data.title,
        description: data.description,
        category: data.category,
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
        assets: {
          create: data.assets.map((a) => ({
            id: a.id,
            fileKey: a.fileKey,
            position: a.position,
            assetType: a.assetType,
          })),
        },
      },
    });

    return Result.ok(auction);
  }

  async update(auction: Auction): Promise<Result<Auction>> {
    const data = AuctionMapper.toPersistence(auction);

    await this._prisma.auction.update({
      where: { id: data.id },
      data: {
        auctionType: data.auctionType,
        title: data.title,
        description: data.description,
        category: data.category,
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
      },
    });

    return Result.ok(auction);
  }

  async findById(id: string): Promise<Result<Auction>> {
    const raw = await this._prisma.auction.findUnique({
      where: { id },
      include: { assets: true },
    });
    if (!raw) return Result.fail('Auction not found');
    return AuctionMapper.toDomain(raw as PrismaAuctionWithAssets);
  }

  async findBySellerId(sellerId: string): Promise<Result<Auction[]>> {
    const list = await this._prisma.auction.findMany({
      where: { sellerId },
      include: { assets: true },
      orderBy: { createdAt: 'desc' },
    });

    const result: Auction[] = [];

    for (const raw of list as PrismaAuctionWithAssets[]) {
      const r = AuctionMapper.toDomain(raw);
      if (r.isFailure) return Result.fail(r.getError());
      result.push(r.getValue());
    }
    return Result.ok(result);
  }

  async findForBrowse(
    filters: IFindForBrowseFilters,
  ): Promise<Result<Auction[]>> {
    const where: {
      status: 'ACTIVE';
      category?: string;
      auctionType?: 'LONG' | 'LIVE' | 'SEALED';
    } = {
      status: 'ACTIVE',
    };

    if (filters.category) where.category = filters.category;
    if (filters.auctionType)
      where.auctionType =
        (filters.auctionType as AuctionType | 'ALL') === 'ALL'
          ? undefined
          : (filters.auctionType as AuctionType);

    const list = await this._prisma.auction.findMany({
      where,
      include: { assets: true },
      orderBy: { startAt: 'desc' },
    });

    const result: Auction[] = [];
    for (const raw of list as PrismaAuctionWithAssets[]) {
      const r = AuctionMapper.toDomain(raw);
      if (r.isFailure) return Result.fail(r.getError());
      result.push(r.getValue());
    }
    return Result.ok(result);
  }
}
