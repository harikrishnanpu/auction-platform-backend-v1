import {
  IRejectAuctionCategoryrequestInputDto,
  IRejectAuctionCategoryrequestOutputDto,
} from '@application/dtos/admin/rejectAuctionCategory.dto';
import { IRejectAuctionCategoryrequestUsecase } from '@application/interfaces/usecases/admin/IRejectAuctionCategoryrequestusecase';
import { AuctionMapperProrfile } from '@application/mappers/auction/auction.mapperProfile';
import { TYPES } from '@di/types.di';
import { IAuctionCategoryRepository } from '@domain/repositories/IAuctionCategoryRepo';
import { Result } from '@domain/shared/result';
import { inject } from 'inversify';

export class RejectAuctionCategoryUsecase implements IRejectAuctionCategoryrequestUsecase {
  constructor(
    @inject(TYPES.IAuctionCategoryRepository)
    private readonly _auctionCategoryRepository: IAuctionCategoryRepository,
  ) {}

  async execute(
    data: IRejectAuctionCategoryrequestInputDto,
  ): Promise<Result<IRejectAuctionCategoryrequestOutputDto>> {
    const { categoryId, reason } = data;

    const categoryEntity =
      await this._auctionCategoryRepository.findById(categoryId);
    if (categoryEntity.isFailure) {
      return Result.fail(categoryEntity.getError());
    }

    const category = categoryEntity.getValue();
    if (!category) {
      return Result.fail('Auction category not found');
    }

    category.rejectAuctionCategory(reason);
    await this._auctionCategoryRepository.save(category);

    const output =
      AuctionMapperProrfile.toRejectAuctionCategoryResponseDto(category);
    return Result.ok(output);
  }
}
