export interface IFallbackPublicNotificationQueuePayload {
    auctionId: string;
}

export interface IFallbackPublicNotificationQueue {
    enqueue(payload: IFallbackPublicNotificationQueuePayload): Promise<void>;
}
