import { IAuctionRoomParticipantDto } from './getAuctionRoom.dto';

export interface IPlaceBidInput {
    auctionId: string;
    userId: string;
    userName: string;
    amount: number;
}

export interface IValidatedBidPayload {
    amount: number | null;
    encryptedAmount: string | null;
}

export interface IPlaceBidOutput {
    id: string;
    auctionId: string;
    userId: string;
    amount: number | null;
    createdAt: string;
    endAt: string;
    extensionCount: number;
    participants: IAuctionRoomParticipantDto[];
}
