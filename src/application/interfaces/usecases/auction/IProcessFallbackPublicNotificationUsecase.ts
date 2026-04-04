import { Result } from '@domain/shared/result';

export interface IProcessFallbackPublicNotificationUsecase {
    execute(auctionId: string): Promise<Result<void>>;
}
