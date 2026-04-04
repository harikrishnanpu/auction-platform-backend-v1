import {
    AuctionParticipant,
    AuctionParticipantPaymentStatus,
} from '@domain/entities/auction/auction-participant.entity';
import { Result } from '@domain/shared/result';
import { AuctionParticipant as PrismaAuctionParticipant } from '@prisma/client';

export class AuctionParticipantMapper {
    static toDomain(raw: PrismaAuctionParticipant): Result<AuctionParticipant> {
        return AuctionParticipant.create({
            id: raw.id,
            auctionId: raw.auctionId,
            userId: raw.userId,
            userName: raw.userName,
            intialAmount: raw.intialAmount as AuctionParticipantPaymentStatus,
            joinedAt: raw.joinedAt,
        });
    }

    static toPersistence(participant: AuctionParticipant) {
        return {
            id: participant.getId(),
            auctionId: participant.getAuctionId(),
            userId: participant.getUserId(),
            userName: participant.getUserName(),
            initialAmount: participant.getIntialAmount(),
            joinedAt: participant.getJoinedAt(),
        };
    }
}
