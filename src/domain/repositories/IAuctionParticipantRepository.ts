import { AuctionParticipant } from '@domain/entities/auction/auction-participant.entity';
import { Result } from '@domain/shared/result';

export interface IAuctionParticipantRepository {
    save(data: AuctionParticipant): Promise<Result<AuctionParticipant>>;

    findByAuctionId(auctionId: string): Promise<Result<AuctionParticipant[]>>;
}
