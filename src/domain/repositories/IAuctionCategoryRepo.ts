import { AuctionCategory } from '@domain/entities/auction/auction-category.entity';
import { Result } from '@domain/shared/result';
import { AuctionCategorySlug } from '@domain/value-objects/auction-category-slug.vo';

export interface AuctionCategoryFilter {
    isVerified: boolean | undefined;
    isActive: boolean | undefined;
    submittedBy: string | undefined;
    parentId: string | null;
}

export interface IAuctionCategoryRepository {
    save(category: AuctionCategory): Promise<Result<void>>;
    findBySlug(
        slug: AuctionCategorySlug,
    ): Promise<Result<AuctionCategory | null>>;
    findAll(filters: AuctionCategoryFilter): Promise<Result<AuctionCategory[]>>;
    findById(id: string): Promise<Result<AuctionCategory | null>>;
}
