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
} from '@prisma/client';

export type PrismaAuctionWithAssets = PrismaAuction & {
  assets: PrismaAuctionAsset[];
};

export class AuctionMapper {
  static toDomain(raw: PrismaAuctionWithAssets): Result<Auction> {
    const assets = raw.assets.map((a) =>
      AuctionAsset.create({
        id: a.id,
        auctionId: a.auctionId,
        fileKey: a.fileKey,
        position: a.position,
        assetType: (a.assetType as AuctionAssetType) ?? AuctionAssetType.IMAGE,
      }),
    );
    return Auction.create({
      id: raw.id,
      sellerId: raw.sellerId,
      auctionType: (raw.auctionType as AuctionType) ?? AuctionType.LONG,
      title: raw.title,
      description: raw.description,
      category: raw.categoryId,
      condition: raw.condition,
      startPrice: raw.startPrice,
      minIncrement: raw.minIncrement,
      startAt: raw.startAt,
      endAt: raw.endAt,
      status: (raw.status as AuctionStatus) ?? AuctionStatus.DRAFT,
      antiSnipSeconds: raw.antiSnipSeconds ?? 60,
      extensionCount: raw.extensionCount ?? 0,
      maxExtensionCount: raw.maxExtensionCount ?? 3,
      bidCooldownSeconds: raw.bidCooldownSeconds ?? 10,
      winnerId: raw.winnerId ?? null,
      assets,
    });
  }

  static toPersistence(auction: Auction) {
    return {
      id: auction.getId(),
      sellerId: auction.getSellerId(),
      auctionType: auction.getAuctionType(),
      title: auction.getTitle(),
      description: auction.getDescription(),
      category: auction.getCategory(),
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
