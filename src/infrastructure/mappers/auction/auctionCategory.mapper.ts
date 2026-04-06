import {
    AuctionCategory,
    AuctionCategoryStatus,
} from '@domain/entities/auction/auction-category.entity';
// import { IMapper } from '@domain/mappers/IMapper';
import { Result } from '@domain/shared/result';
import { AuctionCategorySlug } from '@domain/value-objects/auction-category-slug.vo';
import { AuctionCategory as PrismaAuctionCategory } from '@prisma/client';

interface PrismaAuctionCategoryWithSubmittedByUser extends PrismaAuctionCategory {
    submittedByUser?: {
        name?: string;
    };
}

export class AuctionCategoryMapper {
    static toDomain(
        raw: PrismaAuctionCategoryWithSubmittedByUser,
    ): Result<AuctionCategory> {
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
            submittedByUser: raw.submittedByUser?.name,
        });

        return Result.ok(auctionCategoryEntity.getValue());
    }

    static toPersistence(entity: AuctionCategory) {
        return {
            id: entity.getId(),
            name: entity.getName(),
            slug: entity.getSlug().getValue(),
            parentId: entity.getParentId(),
            isVerified: entity.getIsVerified(),
            isActive: entity.getIsActive(),
            status: entity.getStatus(),
            submittedBy: entity.getSubmittedBy(),
            rejectionReason: entity.getRejectionReason(),
        };
    }
}
