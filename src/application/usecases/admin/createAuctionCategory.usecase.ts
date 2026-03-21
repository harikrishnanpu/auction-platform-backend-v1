import {
  ICreateAuctionCategoryInputDto,
  ICreateAuctionCategoryOutputDto,
} from '@application/dtos/admin/createAuctionCategory.dto';
import { ICreateAuctionCategoryUsecase } from '@application/interfaces/usecases/admin/ICreateAuctionCategoryUsecase';
import { TYPES } from '@di/types.di';
import { IAuctionCategoryRepository } from '@domain/repositories/IAuctionCategoryRepo';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';
import { AuctionCategory } from '@domain/entities/auction/auction-category.entity';
import { AuctionCategorySlug } from '@domain/value-objects/auction-category-slug.vo';
import { AuctionCategoryStatus } from '@domain/entities/auction/auction-category.entity';
import { ISlugGeneratorService } from '@application/interfaces/services/ISlugGeneratorService';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';

@injectable()
export class CreateAuctionCategoryUsecase implements ICreateAuctionCategoryUsecase {
  constructor(
    @inject(TYPES.IAuctionCategoryRepository)
    private readonly _auctionCategoryRepository: IAuctionCategoryRepository,
    @inject(TYPES.IIdGeneratingService)
    private readonly _idGeneratingService: IIdGeneratingService,
    @inject(TYPES.ISlugGeneratorService)
    private readonly _slugGeneratorService: ISlugGeneratorService,
  ) {}

  async execute(
    data: ICreateAuctionCategoryInputDto,
  ): Promise<Result<ICreateAuctionCategoryOutputDto>> {
    console.log('data CAT', data);

    const generatedSlug = this._slugGeneratorService.generateSlug(data.name);

    const slugVo = AuctionCategorySlug.create(generatedSlug);
    if (slugVo.isFailure) return Result.fail(slugVo.getError()!);

    const existing = await this._auctionCategoryRepository.findBySlug(
      slugVo.getValue(),
    );

    if (existing.isFailure) return Result.fail(existing.getError());
    if (existing.getValue())
      return Result.fail('Auction category already exists');

    const createdEntity = AuctionCategory.create({
      id: this._idGeneratingService.generateId(),
      name: data.name,
      slug: slugVo.getValue(),
      parentId: data.parentId ?? null,
      isVerified: true,
      isActive: true,
      status: AuctionCategoryStatus.APPROVED,
      submittedBy: data.userId,
      rejectionReason: null,
    });

    if (createdEntity.isFailure) {
      return Result.fail(createdEntity.getError()!);
    }

    await this._auctionCategoryRepository.save(createdEntity.getValue());

    const cat = createdEntity.getValue();
    const output: ICreateAuctionCategoryOutputDto = {
      categoryId: cat.getId(),
      name: cat.getName(),
      parentId: cat.getParentId(),
    };

    return Result.ok(output);
  }
}
