import { Result } from '@domain/shared/result';

export interface ISendPublicFallbackPublicNotificationUsecase {
    execute(auctionId: string): Promise<Result<void>>;
}
