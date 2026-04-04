import { AuctionParticipant } from '@domain/entities/auction/auction-participant.entity';

export interface IAddAuctionParticipantInput {
    auctionId: string;
    userId: string;
}

export interface IAddAuctionParticipantOutput {
    auctionParticipants: AuctionParticipant[];
}
