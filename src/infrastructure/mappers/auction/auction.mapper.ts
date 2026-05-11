import {
    AuctionAsset,
    AuctionAssetType,
} from '@domain/entities/auction/auction-asset.entity';
import {
    Auction,
    AuctionStatus,
    AuctionType,
} from '@domain/entities/auction/auction.entity';
import { Result } from '@domain/shared/result';
import {
    Auction as PrismaAuction,
    AuctionAsset as PrismaAuctionAsset,
    AuctionCategory as PrismaAuctionCategory,
} from '@prisma/client';
import { IDbMapper } from '@domain/mappers/IDbMapper';
import { inject } from 'inversify';
import { TYPES } from '@di/types.di';
import { AuctionCategorySlug } from '@domain/value-objects/auction-category-slug.vo';
import { AuctionCategory } from '@domain/entities/auction/auction-category.entity';

export type PrismaAuctionWithAssets = PrismaAuction & {
    assets: PrismaAuctionAsset[];
    category: PrismaAuctionCategory & { submittedByUser: { name: string } };
};

export class AuctionMapper implements IDbMapper<
    Auction,
    PrismaAuctionWithAssets
> {
    constructor(
        @inject(TYPES.AuctionCategoryMapper)
        private readonly auctionCategoryMapper: IDbMapper<
            AuctionCategory,
            PrismaAuctionCategory & { submittedByUser: { name: string } }
        >,
    ) {}

    toDomain(raw: PrismaAuctionWithAssets): Result<Auction> {
        const assets = raw.assets.map((a) =>
            AuctionAsset.create({
                id: a.id,
                auctionId: a.auctionId,
                fileKey: a.fileKey,
                position: a.position,
                assetType:
                    (a.assetType as AuctionAssetType) ?? AuctionAssetType.IMAGE,
            }),
        );

        const category = this.auctionCategoryMapper.toDomain(raw.category);
        if (category.isFailure) return Result.fail(category.getError());

        const auctionCategorySLug = AuctionCategorySlug.create(
            category.getValue().getSlug().getValue(),
        );

        if (auctionCategorySLug.isFailure)
            return Result.fail(auctionCategorySLug.getError());

        return Auction.create({
            id: raw.id,
            auctionNumber: raw.auctionNumber,
            sellerId: raw.sellerId,
            auctionType: (raw.auctionType as AuctionType) ?? AuctionType.LONG,
            title: raw.title,
            description: raw.description,
            category: category.getValue(),
            condition: raw.condition,
            startPrice: raw.startPrice,
            minIncrement: raw.minIncrement,
            startAt: raw.startAt,
            endAt: new Date(raw.endAt),
            status: (raw.status as AuctionStatus) ?? AuctionStatus.DRAFT,
            antiSnipSeconds: raw.antiSnipSeconds ?? 60,
            extensionCount: raw.extensionCount ?? 0,
            maxExtensionCount: raw.maxExtensionCount ?? 3,
            bidCooldownSeconds: raw.bidCooldownSeconds ?? 10,
            winnerId: raw.winnerId ?? null,
            winAmount: raw.winAmount ?? null,
            assets,
        });
    }

    toPersistence(auction: Auction) {
        return {
            id: auction.getId(),
            auctionNumber: auction.getAuctionNumber(),
            sellerId: auction.getSellerId(),
            auctionType: auction.getAuctionType(),
            title: auction.getTitle(),
            description: auction.getDescription(),
            categoryId: auction.getCategoryId(),
            condition: auction.getCondition(),
            startPrice: auction.getStartPrice(),
            minIncrement: auction.getMinIncrement(),
            startAt: auction.getStartAt(),
            endAt: auction.getEndAt(),
            status: auction.getStatus(),
            antiSnipSeconds: auction.getAntiSnipSeconds(),
            extensionCount: auction.getExtensionCount(),
            maxExtensionCount: auction.getMaxExtensionCount(),
            bidCooldownSeconds: auction.getBidCooldownSeconds(),
            winnerId: auction.getWinnerId(),
            winAmount: auction.getWinAmount(),
            assets: auction.getAssets().map((a) => ({
                id: a.getId(),
                auctionId: a.getAuctionId(),
                fileKey: a.getFileKey(),
                position: a.getPosition(),
                assetType: a.getAssetType(),
            })),
        };
    }
}
