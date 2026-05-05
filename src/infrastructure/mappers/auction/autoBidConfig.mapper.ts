import {
    AutoBidConfig,
    AutoBidStrategy,
} from '@domain/entities/auction/auto-bid-config.entity';
import { IDbMapper } from '@domain/mappers/IDbMapper';
import { Result } from '@domain/shared/result';
import {
    AutoBidConfig as PrismaAutoBidConfig,
    BidStrategy as PrismaBidStrategy,
} from '@prisma/client';

export class AutoBidConfigMapper implements IDbMapper<
    AutoBidConfig,
    PrismaAutoBidConfig
> {
    toDomain(raw: PrismaAutoBidConfig): Result<AutoBidConfig> {
        return AutoBidConfig.create({
            id: raw.id,
            userId: raw.userId,
            auctionId: raw.auctionId,
            maxBidAmount: raw.maxBidAmount,
            strategy: raw.biddingStrategy as AutoBidStrategy,
            isActive: raw.isActive,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }

    toPersistence(entity: AutoBidConfig): unknown {
        return {
            id: entity.getId(),
            userId: entity.getUserId(),
            auctionId: entity.getAuctionId(),
            maxBidAmount: entity.getMaxBidAmount(),
            biddingStrategy: entity.getStrategy() as PrismaBidStrategy,
            isActive: entity.getIsActive(),
            createdAt: entity.getCreatedAt(),
            updatedAt: entity.getUpdatedAt(),
        };
    }
}
