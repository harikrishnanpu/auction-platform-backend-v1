import {
  AuctionCategory,
  AuctionCategoryStatus,
} from '@domain/entities/auction/auction-category.entity';
import { Result } from '@domain/shared/result';
import { AuctionCategorySlug } from '@domain/value-objects/auction-category-slug.vo';
import { AuctionCategory as PrismaAuctionCategory } from '@prisma/client';

export class AuctionCategoryMapper {
  static toDomain(raw: PrismaAuctionCategory): Result<AuctionCategory> {
    const slugVo = AuctionCategorySlug.create(raw.slug);
    if (slugVo.isFailure) return Result.fail(slugVo.getError());

    const auctionCategoryEntity = AuctionCategory.create({
      id: raw.id,
      name: raw.name,
      slug: slugVo.getValue(),
      parentId: raw.parentId,
      isVerified: raw.isVerified,
      isActive: raw.isActive,
      status: raw.status as AuctionCategoryStatus,
      rejectionReason: raw.rejectionReason,
      submittedBy: raw.submittedBy,
    });

    return Result.ok(auctionCategoryEntity.getValue());
  }
}
