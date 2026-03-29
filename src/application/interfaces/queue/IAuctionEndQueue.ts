export interface IAuctionEndQueuePayload {
    auctionId: string;
    auctionTitle: string;
    winnerId: string | null;
    winAmount: number;
    endedAt: Date;
}

export interface IAuctionEndQueue {
    enqueue(payload: IAuctionEndQueuePayload): Promise<void>;
}
