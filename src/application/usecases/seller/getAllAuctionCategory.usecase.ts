import {
  IGetAllAuctionCategoryRequestInputDto,
  IGetAllAuctionCategoryRequestOutputDto,
} from '@application/dtos/seller/getAllAuctionCategoryRequest.dto';
import { IGetAllSellerAuctionCategoryRequestUsecase } from '@application/interfaces/usecases/seller/IGetAllAuctioncategoryRequestUsecase';
import { AuctionMapperProrfile } from '@application/mappers/auction/auction.mapperProfile';
import { TYPES } from '@di/types.di';
import { IAuctionCategoryRepository } from '@domain/repositories/IAuctionCategoryRepo';
import { Result } from '@domain/shared/result';
import { inject } from 'inversify';

export class GetAllSellerAuctionCategoryRequestUsecase implements IGetAllSellerAuctionCategoryRequestUsecase {
  constructor(
    @inject(TYPES.IAuctionCategoryRepository)
    private readonly _auctionCategoryRepository: IAuctionCategoryRepository,
  ) {}

  async execute(
    input: IGetAllAuctionCategoryRequestInputDto,
  ): Promise<Result<IGetAllAuctionCategoryRequestOutputDto>> {
    const categories = await this._auctionCategoryRepository.findAll({
      isVerified: false,
      isActive: true,
      submittedBy: input.userId,
    });

    if (categories.isFailure) {
      return Result.fail(categories.getError());
    }

    const output = AuctionMapperProrfile.toGetAllAuctionCategoryResponseDto(
      categories.getValue(),
    );

    return Result.ok(output);
  }
}
