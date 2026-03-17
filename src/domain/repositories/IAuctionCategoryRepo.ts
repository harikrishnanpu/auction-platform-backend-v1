import { AuctionCategory } from '@domain/entities/auction/auction-category.entity';
import { Result } from '@domain/shared/result';
import { AuctionCategorySlug } from '@domain/value-objects/auction-category-slug.vo';

export interface IAuctionCategoryRepository {
  save(category: AuctionCategory): Promise<Result<void>>;
  findBySlug(
    slug: AuctionCategorySlug,
  ): Promise<Result<AuctionCategory | null>>;
  findAll(): Promise<Result<AuctionCategory[]>>;
}
