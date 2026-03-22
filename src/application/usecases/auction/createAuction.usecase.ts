import { ICreateAuctionInputDto } from '@application/dtos/auction/create-auction.dto';
import { ICreateAuctionUsecase } from '@application/interfaces/usecases/auction/ICreateAuctionUsecase';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { TYPES } from '@di/types.di';
import {
  Auction,
  AuctionStatus,
} from '@domain/entities/auction/auction.entity';
import {
  AuctionAsset,
  AuctionAssetType,
} from '@domain/entities/auction/auction-asset.entity';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';
import { AuctionMapperProrfile } from '@application/mappers/auction/auction.mapperProfile';
import { IAuctionCategoryRepository } from '@domain/repositories/IAuctionCategoryRepo';
import { IAuctionDto } from '@application/dtos/auction/auction.dto';
// import { AuctionCreateStartegyFactory } from '@application/strategies/factory/auctionCreateStartegy.factory';

@injectable()
export class CreateAuctionUsecase implements ICreateAuctionUsecase {
  constructor(
    @inject(TYPES.IAuctionRepository)
    private readonly _auctionRepository: IAuctionRepository,
    @inject(TYPES.IIdGeneratingService)
    private readonly _idGeneratingService: IIdGeneratingService,
    @inject(TYPES.IAuctionCategoryRepository)
    private readonly _auctionCategoryRepository: IAuctionCategoryRepository,
  ) {}

  async execute(input: ICreateAuctionInputDto): Promise<Result<IAuctionDto>> {
    console.log('CREATE AUCTION INPUT: ', input);

    // const strategy = AuctionCreateStartegyFactory.create(input.auctionType);
    // const validatedInput = strategy.validate(input);
    // if(validatedInput.isFailure) return Result.fail(validatedInput.getError());
    // const validatedAuctionInput = validatedInput.getValue();

    const categoryResult = await this._auctionCategoryRepository.findById(
      input.categoryId,
    );

    if (categoryResult.isFailure) return Result.fail(categoryResult.getError());

    const category = categoryResult.getValue();

    if (!category) {
      return Result.fail('Auction category not found');
    }

    const auctionId = this._idGeneratingService.generateId();

    const assets = (input.assets ?? []).map((a, index) => {
      return AuctionAsset.create({
        id: this._idGeneratingService.generateId(),
        auctionId,
        fileKey: a.fileKey,
        position: a.position ?? index,
        assetType: a.assetType ?? AuctionAssetType.IMAGE,
      });
    });

    const auctionResult = Auction.create({
      id: auctionId,
      sellerId: input.userId,
      auctionType: input.auctionType,
      title: input.title,
      description: input.description,
      category: category,
      condition: input.condition,
      startPrice: input.startPrice,
      minIncrement: input.minIncrement,
      startAt: input.startAt,
      endAt: input.endAt,
      status: AuctionStatus.DRAFT,
      antiSnipSeconds: input.antiSnipSeconds,
      maxExtensionCount: input.maxExtensionCount,
      bidCooldownSeconds: input.bidCooldownSeconds,
      assets: assets,
    });

    if (auctionResult.isFailure) return Result.fail(auctionResult.getError());
    const auction = auctionResult.getValue();

    const savedResult = await this._auctionRepository.save(auction);
    if (savedResult.isFailure) return Result.fail(savedResult.getError());

    const saved = savedResult.getValue();

    const output: IAuctionDto = AuctionMapperProrfile.toAuctionOutputDto(saved);

    return Result.ok(output);
  }
}
