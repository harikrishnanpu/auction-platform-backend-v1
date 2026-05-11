import { AutoBidConfig } from '@domain/entities/auction/auto-bid-config.entity';
import { Result } from '@domain/shared/result';

export interface IAutoBidConfigRepository {
    save(config: AutoBidConfig): Promise<Result<AutoBidConfig>>;
    disableAllActiveByAuctionId(auctionId: string): Promise<Result<void>>;
    findByUserAndAuction(
        userId: string,
        auctionId: string,
    ): Promise<Result<AutoBidConfig | null>>;
    findActiveByAuctionId(auctionId: string): Promise<Result<AutoBidConfig[]>>;
}
