import { Result } from '@domain/shared/result';
import { AuctionCategorySlug } from '@domain/value-objects/auction-category-slug.vo';

export class AuctionCategory {
  constructor(
    private readonly id: string,
    private readonly name: string,
    private readonly slug: AuctionCategorySlug,
    private readonly parentId: string | null,
    private readonly isVerified: boolean,
    private readonly isActive: boolean,
  ) {}

  static create({
    id,
    name,
    slug,
    parentId = null,
    isVerified = false,
    isActive = true,
  }: {
    id: string;
    name: string;
    slug: AuctionCategorySlug;
    parentId: string | null;
    isVerified: boolean;
    isActive: boolean;
  }): Result<AuctionCategory> {
    return Result.ok(
      new AuctionCategory(id, name, slug, parentId, isVerified, isActive),
    );
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getSlug(): AuctionCategorySlug {
    return this.slug;
  }

  getIsVerified(): boolean {
    return this.isVerified;
  }

  getIsActive(): boolean {
    return this.isActive;
  }

  getParentId(): string | null {
    return this.parentId;
  }
}
