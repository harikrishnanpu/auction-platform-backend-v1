import { AuctionParticipant } from '@domain/entities/auction/auction-participant.entity';
import { Result } from '@domain/shared/result';

export interface IAuctionParticipantRepository {
    save(data: AuctionParticipant): Promise<Result<void>>;

    findByAuctionId(auctionId: string): Promise<Result<AuctionParticipant[]>>;
    findByUserId(userId: string): Promise<Result<AuctionParticipant[]>>;
}
