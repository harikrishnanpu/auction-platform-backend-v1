import { Bid } from '@domain/entities/auction/bid.entity';
import { Result } from '@domain/shared/result';
import { Bid as PrismaBid } from '@prisma/client';

export class BidMapper {
    static toDomain(raw: PrismaBid): Result<Bid> {
        return Bid.create({
            id: raw.id,
            auctionId: raw.auctionId,
            userId: raw.userId,
            amount: raw.amount,
            encryptedAmount: raw.encryptedAmount,
            createdAt: raw.createdAt,
        });
    }

    static toPersistence(bid: Bid) {
        return {
            id: bid.getId(),
            auctionId: bid.getAuctionId(),
            userId: bid.getUserId(),
            amount: bid.getAmount(),
            encryptedAmount: bid.getEncryptedAmount(),
            createdAt: bid.getCreatedAt(),
        };
    }
}
