import { PublicAuctionFallbackParticipants } from '@domain/entities/auction/public-auction-fallback-participants.entity';
import { Result } from '@domain/shared/result';

export interface IFallbackAuctionParticipantsRepo {
    save(
        publicAuctionFallbackParticipants: PublicAuctionFallbackParticipants,
    ): Promise<Result<void>>;
    findByAuctionIdAndUserId(
        auctionId: string,
        userId: string,
    ): Promise<Result<PublicAuctionFallbackParticipants | null>>;
    findByAuctionId(
        auctionId: string,
    ): Promise<Result<PublicAuctionFallbackParticipants[]>>;
}
