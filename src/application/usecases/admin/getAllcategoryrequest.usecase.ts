import { IGetAllAdminAuctionCategoryResponseDto } from '@application/dtos/admin/getAllCategoryRequest.dto';
import { IGetAllCategoryRequestUsecase } from '@application/interfaces/usecases/admin/IGetAllCategoryrequestusecase';
import { AuctionMapperProrfile } from '@application/mappers/auction/auction.mapperProfile';
import { TYPES } from '@di/types.di';
import { IAuctionCategoryRepository } from '@domain/repositories/IAuctionCategoryRepo';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class GetAllCategoryRequestUsecase implements IGetAllCategoryRequestUsecase {
  constructor(
    @inject(TYPES.IAuctionCategoryRepository)
    private readonly _auctionCategoryRepository: IAuctionCategoryRepository,
  ) {}

  async execute(): Promise<Result<IGetAllAdminAuctionCategoryResponseDto>> {
    const categories = await this._auctionCategoryRepository.findAll({
      isVerified: false,
      isActive: true,
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
