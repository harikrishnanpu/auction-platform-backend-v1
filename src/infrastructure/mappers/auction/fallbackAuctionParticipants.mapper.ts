import {
    PublicAuctionFallbackParticipants,
    PublicAuctionFallbackParticipantsPaymentStatus,
    PublicAuctionFallbackParticipantsStatus,
} from '@domain/entities/auction/public-auction-fallback-participants.entity';
import { Result } from '@domain/shared/result';
import { PublicFallbackAuctionParticipants as PrismaPublicFallbackAuctionParticipants } from '@prisma/client';

export class FallbackAuctionParticipantsMapper {
    public static toPersistence(
        publicAuctionFallbackParticipants: PublicAuctionFallbackParticipants,
    ) {
        return {
            id: publicAuctionFallbackParticipants.getId(),
            publicFallbackAuctionId:
                publicAuctionFallbackParticipants.getPublicFallbackAuctionId(),
            userId: publicAuctionFallbackParticipants.getUserId(),
            status: publicAuctionFallbackParticipants.getStatus(),
            paymentStatus: publicAuctionFallbackParticipants.getPaymentStatus(),
        };
    }

    public static toDomain(
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
