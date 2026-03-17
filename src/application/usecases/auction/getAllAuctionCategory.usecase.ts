import { GetAllAuctionDto } from '@application/dtos/auction/getAllAuction.dto';
import { IGetAllAuctionCategoriesUsecase } from '@application/interfaces/usecases/auction/IGetAllAuctionCategoriesUsecase';
import { AuctionMapperProrfile } from '@application/mappers/auction/auction.mapperProfile';
import { TYPES } from '@di/types.di';
import { IAuctionCategoryRepository } from '@domain/repositories/IAuctionCategoryRepo';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class GetAllAuctionCategoryUsecase implements IGetAllAuctionCategoriesUsecase {
  constructor(
    @inject(TYPES.IAuctionCategoryRepository)
    private readonly _auctionCategoryRepository: IAuctionCategoryRepository,
  ) {}

  async execute(): Promise<Result<GetAllAuctionDto>> {
    const allCategories = await this._auctionCategoryRepository.findAll();

    const output = AuctionMapperProrfile.toGetAllAuctionResponseDto(
      allCategories.getValue(),
    );

    return Result.ok(output);
  }
}
