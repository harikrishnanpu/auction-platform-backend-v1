import type {
  IGetBrowseAuctionsInputDto,
  IGetBrowseAuctionsOutputDto,
  IGetBrowseAuctionsUsecase,
} from '@application/interfaces/usecases/auction/IGetBrowseAuctionsUsecase';
import { AuctionMapperProrfile } from '@application/mappers/auction/auction.mapperProfile';
import { TYPES } from '@di/types.di';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { AuctionStatus } from '@domain/entities/auction/auction.entity';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class GetBrowseAuctionsUsecase implements IGetBrowseAuctionsUsecase {
  constructor(
    @inject(TYPES.IAuctionRepository)
    private readonly _auctionRepository: IAuctionRepository,
  ) {}

  async execute(
    input: IGetBrowseAuctionsInputDto,
  ): Promise<Result<IGetBrowseAuctionsOutputDto>> {
    const safePage = Number(input.page) > 0 ? input.page : 1;
    const safeLimit = Number(input.limit) > 0 ? input.limit : 10;

    const auctionsRes = await this._auctionRepository.findAll({
      status: 'ALL',
      auctionType: input.auctionType,
      categoryId: input.categoryId,
      sort: input.sort,
      order: input.order,
      search: input.search,
    });

    if (auctionsRes.isFailure) return Result.fail(auctionsRes.getError());

    const allAuctions = auctionsRes.getValue();
    const eligible = allAuctions.filter(
      (a) =>
        a.getStatus() === AuctionStatus.ACTIVE ||
        a.getStatus() === AuctionStatus.PAUSED,
    );
    const total = eligible.length;
    const totalPages = Math.max(1, Math.ceil(total / safeLimit));
    const currentPage = Math.min(safePage, totalPages);

    const start = (currentPage - 1) * safeLimit;
    const end = start + safeLimit;

    const auctionsResult = eligible
      .slice(start, end)
      .map((a) => AuctionMapperProrfile.toAuctionOutputDto(a));

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
