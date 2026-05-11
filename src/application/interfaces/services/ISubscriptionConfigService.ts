import { Result } from '@domain/shared/result';

export interface ISubscriptionConfigService {
    canCreateAuction(userId: string): Promise<Result<boolean>>;
    canPlaceBid(userId: string, auctionId: string): Promise<Result<boolean>>;
}
