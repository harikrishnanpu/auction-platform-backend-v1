import {
    AuctionParticipant,
    AuctionParticipantPaymentStatus,
} from '@domain/entities/auction/auction-participant.entity';
import { IDbMapper } from '@domain/mappers/IDbMapper';
import { Result } from '@domain/shared/result';
import { AuctionParticipant as PrismaAuctionParticipant } from '@prisma/client';

export class AuctionParticipantMapper implements IDbMapper<
    AuctionParticipant,
    PrismaAuctionParticipant
> {
    toDomain(raw: PrismaAuctionParticipant): Result<AuctionParticipant> {
        return AuctionParticipant.create({
            id: raw.id,
            auctionId: raw.auctionId,
            userId: raw.userId,
            userName: raw.userName,
            intialAmount: raw.intialAmount as AuctionParticipantPaymentStatus,
            joinedAt: raw.joinedAt,
        });
    }

    toPersistence(participant: AuctionParticipant): PrismaAuctionParticipant {
        return {
            id: participant.getId(),
            auctionId: participant.getAuctionId(),
            userId: participant.getUserId(),
            userName: participant.getUserName(),
            intialAmount: participant.getIntialAmount(),
            joinedAt: participant.getJoinedAt(),
        };
    }
}
