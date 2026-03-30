export interface IAuctionWinnerFallbackJobPayload {
    auctionId: string;
    declinedUserId: string;
    paymentId: string;
}

export interface IAuctionWinnerFallbackQueue {
    enqueue(payload: IAuctionWinnerFallbackJobPayload): Promise<void>;
}
