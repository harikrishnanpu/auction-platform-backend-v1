import { TYPES } from '@di/types.di';
import { AuctionCategory } from '@domain/entities/auction/auction-category.entity';
import { IAuctionCategoryRepository } from '@domain/repositories/IAuctionCategoryRepo';
import { Result } from '@domain/shared/result';
import { AuctionCategorySlug } from '@domain/value-objects/auction-category-slug.vo';
import { AuctionCategoryMapper } from '@infrastructure/mappers/auction/auctionCategory.mapper';
import { PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';

@injectable()
export class PrismaAuctionCategoryRepository implements IAuctionCategoryRepository {
  constructor(
    @inject(TYPES.PrismaClient)
    private readonly _prisma: PrismaClient,
  ) {}

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
        isActive: category.getIsActive(),
        status: category.getStatus(),
      },
      update: {
        name: category.getName(),
        slug: category.getSlug().getValue(),
        isVerified: category.getIsVerified(),
        isActive: category.getIsActive(),
        status: category.getStatus(),
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
    });

    if (!auctionCategory) return Result.ok<AuctionCategory | null>(null);

    const result = AuctionCategoryMapper.toDomain(auctionCategory);

    if (result.isFailure) return Result.fail(result.getError());
    return Result.ok<AuctionCategory>(result.getValue());
  }

  async findAll({
    isVerified,
    isActive,
  }: {
    isVerified: boolean | undefined;
    isActive: boolean | undefined;
  }): Promise<Result<AuctionCategory[]>> {
    const auctionCategories = await this._prisma.auctionCategory.findMany({
      where: {
        isVerified: isVerified,
        isActive: isActive,
      },
    });

    const result = auctionCategories.map((category) => {
      const result = AuctionCategoryMapper.toDomain(category);
      return result.getValue();
    });

    return Result.ok<AuctionCategory[]>(result);
  }

  async findById(id: string): Promise<Result<AuctionCategory | null>> {
    const auctionCategory = await this._prisma.auctionCategory.findUnique({
      where: { id },
    });

    if (!auctionCategory) return Result.ok<AuctionCategory | null>(null);

    const result = AuctionCategoryMapper.toDomain(auctionCategory);

    if (result.isFailure) return Result.fail(result.getError());

    return Result.ok<AuctionCategory | null>(result.getValue());
  }
}
