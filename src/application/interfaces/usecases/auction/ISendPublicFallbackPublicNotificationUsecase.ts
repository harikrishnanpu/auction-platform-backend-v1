export interface ISendPublicFallbackPublicNotificationUsecase {
    execute(auctionId: string): Promise<void>;
}
