export interface IProcessFallbackPublicNotificationUsecase {
    execute(auctionId: string): Promise<void>;
}
