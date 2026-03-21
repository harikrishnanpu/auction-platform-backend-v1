import {
  IGetAllAuctionsInputDto,
  IGetAllAuctionsOutputDto,
} from '@application/dtos/auction/getAllAuction.dto';
import { IGetAllSellerAuctionsUsecase } from '@application/interfaces/usecases/seller/IGetallAuctionsUsecase';
import { AuctionMapperProrfile } from '@application/mappers/auction/auction.mapperProfile';
import { TYPES } from '@di/types.di';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { Result } from '@domain/shared/result';
import { inject } from 'inversify';

export class GetAllSellerAuctionsUsecase implements IGetAllSellerAuctionsUsecase {
  constructor(
    @inject(TYPES.IAuctionRepository)
    private readonly _auctionRepository: IAuctionRepository,
  ) {}

  async execute(
    input: IGetAllAuctionsInputDto,
  ): Promise<Result<IGetAllAuctionsOutputDto>> {
    const safePage = Number(input.page) > 0 ? input.page : 1;
    const safeLimit = Number(input.limit) > 0 ? input.limit : 10;

    const auctions = await this._auctionRepository.findAll({
      sellerId: input.userId,
      status: input.status,
      auctionType: input.auctionType,
      categoryId: input.categoryId,
      sort: input.sort,
      order: input.order,
      search: input.search,
    });

    if (auctions.isFailure) {
      return Result.fail(auctions.getError());
    }

    const allAuctions = auctions.getValue();
    const total = allAuctions.length;
    const totalPages = Math.max(1, Math.ceil(total / safeLimit));
    const currentPage = Math.min(safePage, totalPages);
    const start = (currentPage - 1) * safeLimit;
    const end = start + safeLimit;

    const auctionsResult = allAuctions.slice(start, end).map((a) => {
      return AuctionMapperProrfile.toAuctionOutputDto(a);
    });

    return Result.ok({
      auctions: auctionsResult,
      total,
      page: currentPage,
      limit: safeLimit,
      totalPages,
      currentPage,
    });
  }
}
