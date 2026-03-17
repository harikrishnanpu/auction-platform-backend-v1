import {
  IRequestAuctionCategoryInputDto,
  IRequestAuctionCategoryOutputDto,
} from '@application/dtos/auction/request-auction-category.dto';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { ISlugGeneratorService } from '@application/interfaces/services/ISlugGeneratorService';
import { IRequestAuctionCategoryUsecase } from '@application/interfaces/usecases/auction/IRequestAuctionCategory.usecase';
import { AuctionMapperProrfile } from '@application/mappers/auction/auction.mapperProfile';
import { TYPES } from '@di/types.di';
import { AuctionCategory } from '@domain/entities/auction/auction-category.entity';
import { IAuctionCategoryRepository } from '@domain/repositories/IAuctionCategoryRepo';
import { Result } from '@domain/shared/result';
import { AuctionCategorySlug } from '@domain/value-objects/auction-category-slug.vo';
import { inject, injectable } from 'inversify';

@injectable()
export class RequestAuctionCategoryUsecase implements IRequestAuctionCategoryUsecase {
  constructor(
    @inject(TYPES.IAuctionCategoryRepository)
    private readonly _auctionCategoryRepository: IAuctionCategoryRepository,
    @inject(TYPES.IIdGeneratingService)
    private readonly _idGeneratingService: IIdGeneratingService,
    @inject(TYPES.ISlugGeneratorService)
    private readonly _slugGeneratorService: ISlugGeneratorService,
  ) {}

  async execute(
    input: IRequestAuctionCategoryInputDto,
  ): Promise<Result<IRequestAuctionCategoryOutputDto>> {
    const generatedSlug = this._slugGeneratorService.generateSlug(input.name);

    const auctionCategorySlugVo = AuctionCategorySlug.create(generatedSlug);

    if (auctionCategorySlugVo.isFailure) {
      return Result.fail(auctionCategorySlugVo.getError()!);
    }

    const slug = auctionCategorySlugVo.getValue();

    const existingAuctionCategory =
      await this._auctionCategoryRepository.findBySlug(slug);

    const auctionCat = existingAuctionCategory.getValue();

    if (auctionCat) {
      return Result.fail('Auction category already exists');
    }

    const newAuctionCatEntity = AuctionCategory.create({
      id: this._idGeneratingService.generateId(),
      name: input.name,
      slug: slug,
      parentId: null,
      isVerified: false,
    });

    if (newAuctionCatEntity.isFailure) {
      return Result.fail(newAuctionCatEntity.getError()!);
    }

    const newAuctionCat = newAuctionCatEntity.getValue();

    await this._auctionCategoryRepository.save(newAuctionCat);

    const requestAuctinCategoryOutputDto =
      AuctionMapperProrfile.toRequestAuctionCategoryResponse(newAuctionCat);

    return Result.ok(requestAuctinCategoryOutputDto);
  }
}
