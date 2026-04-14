import {
    AuctionPublicFallbackPaymentStatus,
    AuctionPublicFallbackStatus,
    PublicFallbackAuction,
} from '@domain/entities/auction/public-fallback-auction.entity';
import { IDbMapper } from '@domain/mappers/IDbMapper';
import { Result } from '@domain/shared/result';
import { PublicFallbackAuction as PrismaPublicFallbackAuction } from '@prisma/client';

export class FallbackPublicAuctionMapper implements IDbMapper<
    PublicFallbackAuction,
    PrismaPublicFallbackAuction
> {
    toDomain(data: PrismaPublicFallbackAuction): Result<PublicFallbackAuction> {
        return PublicFallbackAuction.create({
            id: data.id,
            auctionId: data.auctionId,
            amount: data.amount,
            status: data.status as AuctionPublicFallbackStatus,
            paymentStatus:
                data.paymentStatus as AuctionPublicFallbackPaymentStatus,
            createdAt: data.createdAt,
        });
    }

    toPersistence(publicFallbackAuction: PublicFallbackAuction): unknown {
        return {
            id: publicFallbackAuction.getId(),
            auctionId: publicFallbackAuction.getAuctionId(),
            amount: publicFallbackAuction.getAmount(),
            status: publicFallbackAuction.getStatus() as AuctionPublicFallbackStatus,
            paymentStatus:
                publicFallbackAuction.getPaymentStatus() as AuctionPublicFallbackPaymentStatus,
            createdAt: publicFallbackAuction.getCreatedAt(),
        };
    }
}
