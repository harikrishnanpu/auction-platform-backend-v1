export interface WinnerFallbackJobPayload {
    auctionId: string;
    declinedUserId: string;
    paymentId: string;
}

export interface IWinnerFallbackQueue {
    enqueue(payload: WinnerFallbackJobPayload): Promise<void>;
}
