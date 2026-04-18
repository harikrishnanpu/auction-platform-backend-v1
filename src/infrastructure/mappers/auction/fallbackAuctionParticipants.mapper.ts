import {
    PublicAuctionFallbackParticipants,
    PublicAuctionFallbackParticipantsPaymentStatus,
    PublicAuctionFallbackParticipantsStatus,
} from '@domain/entities/auction/public-auction-fallback-participants.entity';
import { IDbMapper } from '@domain/mappers/IDbMapper';
import { Result } from '@domain/shared/result';
import { PublicFallbackAuctionParticipants as PrismaPublicFallbackAuctionParticipants } from '@prisma/client';

export class FallbackAuctionParticipantsMapper implements IDbMapper<
    PublicAuctionFallbackParticipants,
    PrismaPublicFallbackAuctionParticipants
> {
    toPersistence(
        publicAuctionFallbackParticipants: PublicAuctionFallbackParticipants,
    ): unknown {
        return {
            id: publicAuctionFallbackParticipants.getId(),
            publicFallbackAuctionId:
                publicAuctionFallbackParticipants.getPublicFallbackAuctionId(),
            userId: publicAuctionFallbackParticipants.getUserId(),
            status: publicAuctionFallbackParticipants.getStatus(),
            paymentStatus: publicAuctionFallbackParticipants.getPaymentStatus(),
        };
    }

    toDomain(
        data: PrismaPublicFallbackAuctionParticipants,
    ): Result<PublicAuctionFallbackParticipants> {
        return PublicAuctionFallbackParticipants.create({
            id: data.id,
            publicFallbackAuctionId: data.publicFallbackAuctionId,
            userId: data.userId,
            status: data.status as PublicAuctionFallbackParticipantsStatus,
            paymentStatus:
                data.paymentStatus as PublicAuctionFallbackParticipantsPaymentStatus,
            createdAt: data.createdAt,
        });
    }
}
