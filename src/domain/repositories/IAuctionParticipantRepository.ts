import { AuctionParticipant } from '@domain/entities/auction/auction-participant.entity';
import { Result } from '@domain/shared/result';

export interface IAuctionParticipantRepository {
  save(data: {
    auctionId: string;
    userId: string;
    userName: string;
  }): Promise<Result<AuctionParticipant>>;

  findByAuctionId(auctionId: string): Promise<Result<AuctionParticipant[]>>;
}
