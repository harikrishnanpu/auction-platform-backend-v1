import {
    AuctionWinner,
    AuctionWinnerStatus,
} from '@domain/entities/auction/auction-winner.entity';
import { Result } from '@domain/shared/result';
import { AuctionWinner as PrismaAuctionWinner } from '@prisma/client';

export class AuctionWinnerMapper {
    static toPersistence(auctionWinner: AuctionWinner) {
        return {
            id: auctionWinner.getId(),
            auctionId: auctionWinner.getAuctionId(),
            userId: auctionWinner.getUserId(),
            amount: auctionWinner.getAmount(),
            rank: auctionWinner.getRank(),
            status: auctionWinner.getStatus() as AuctionWinnerStatus,
            rejectionReason: auctionWinner.getRejectionReason() ?? null,
            createdAt: new Date(),
        };
    }

    static toDomain(raw: PrismaAuctionWinner): Result<AuctionWinner> {
        return AuctionWinner.create({
            id: raw.id,
            auctionId: raw.auctionId,
            userId: raw.userId,
            amount: raw.amount,
            rank: raw.rank,
            status: raw.status as AuctionWinnerStatus,
            rejectionReason: raw.rejectionReason ?? null,
        });
    }
}
