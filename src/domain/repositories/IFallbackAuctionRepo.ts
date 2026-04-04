import { PublicFallbackAuction } from '@domain/entities/auction/public-fallback-auction.entity';
import { Result } from '@domain/shared/result';

export interface IFallbackAuctionRepo {
    save(publicFallbackAuction: PublicFallbackAuction): Promise<Result<void>>;
    findById(id: string): Promise<Result<PublicFallbackAuction | null>>;
    findByAuctionId(
        auctionId: string,
    ): Promise<Result<PublicFallbackAuction | null>>;
}
