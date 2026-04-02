export interface IFallbackPublicNotificationQueuePayload {
    auctionId: string;
    auctionTitle: string;
}

export interface IFallbackPublicNotificationQueue {
    enqueue(payload: IFallbackPublicNotificationQueuePayload): Promise<void>;
}
