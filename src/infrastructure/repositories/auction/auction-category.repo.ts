import { TYPES } from '@di/types.di';
import { AuctionCategory } from '@domain/entities/auction/auction-category.entity';
import {
    AuctionCategoryFilter,
    IAuctionCategoryRepository,
} from '@domain/repositories/IAuctionCategoryRepo';
import { Result } from '@domain/shared/result';
import { AuctionCategorySlug } from '@domain/value-objects/auction-category-slug.vo';
import { AuctionCategoryMapper } from '@infrastructure/mappers/auction/auctionCategory.mapper';
import { PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { BaseRepository } from '../base/base.Repo';
import { AuctionCategory as PrismaAuctionCategory } from '@prisma/client';
// import { IMapper } from '@domain/mappers/IMapper';

@injectable()
export class PrismaAuctionCategoryRepository
    extends BaseRepository<
        AuctionCategory,
        PrismaAuctionCategory,
        AuctionCategoryFilter
    >
    implements IAuctionCategoryRepository
{
    constructor(
        @inject(TYPES.PrismaClient)
        private readonly _prisma: PrismaClient,
    ) {
        super(_prisma.auctionCategory, AuctionCategoryMapper);
    }

    async save(category: AuctionCategory): Promise<Result<void>> {
        await this._prisma.auctionCategory.upsert({
            where: {
                id: category.getId(),
            },
            create: {
                id: category.getId(),
                name: category.getName(),
                slug: category.getSlug().getValue(),
                isVerified: category.getIsVerified(),
                parentId: category.getParentId(),
                isActive: category.getIsActive(),
                status: category.getStatus(),
                rejectionReason: category.getRejectionReason(),
                submittedBy: category.getSubmittedBy(),
            },
            update: {
                name: category.getName(),
                slug: category.getSlug().getValue(),
                isVerified: category.getIsVerified(),
                isActive: category.getIsActive(),
                status: category.getStatus(),
                parentId: category.getParentId(),
                rejectionReason: category.getRejectionReason(),
            },
        });

        return Result.ok();
    }

    async findBySlug(
        slug: AuctionCategorySlug,
    ): Promise<Result<AuctionCategory | null>> {
        const auctionCategory = await this._prisma.auctionCategory.findUnique({
            where: {
                slug: slug.getValue(),
            },
            include: {
                submittedByUser: true,
            },
        });

        if (!auctionCategory) return Result.ok<AuctionCategory | null>(null);

        const result = AuctionCategoryMapper.toDomain(auctionCategory);

        if (result.isFailure) return Result.fail(result.getError());
        return Result.ok<AuctionCategory>(result.getValue());
    }
}
