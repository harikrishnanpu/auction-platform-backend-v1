import { GetAllAuctionCategoryDto } from '@application/dtos/auction/getAllAuction.dto';
import { IGetAllAdminAuctionCategoriesUsecase } from '@application/interfaces/usecases/admin/IGetAllAuctionCategoriesUsecase';
import { AuctionMapperProrfile } from '@application/mappers/auction/auction.mapperProfile';
import { TYPES } from '@di/types.di';
import { IAuctionCategoryRepository } from '@domain/repositories/IAuctionCategoryRepo';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class GetAllAdminAuctionCategoriesUsecase implements IGetAllAdminAuctionCategoriesUsecase {
  constructor(
    @inject(TYPES.IAuctionCategoryRepository)
    private readonly _auctionCategoryRepository: IAuctionCategoryRepository,
  ) {}

  async execute(): Promise<Result<GetAllAuctionCategoryDto>> {
    const categories = await this._auctionCategoryRepository.findAll({
      isVerified: true,
      isActive: undefined,
      submittedBy: undefined,
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
