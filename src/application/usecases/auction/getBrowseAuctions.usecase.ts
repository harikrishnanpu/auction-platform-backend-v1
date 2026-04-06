import type {
    IGetBrowseAuctionsInputDto,
    IGetBrowseAuctionsOutputDto,
    IGetBrowseAuctionsUsecase,
} from '@application/interfaces/usecases/auction/IGetBrowseAuctionsUsecase';
import { AuctionMapperProrfile } from '@application/mappers/auction/auction.mapperProfile';
import { TYPES } from '@di/types.di';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
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

        const auctionsRes = await this._auctionRepository.findAllForUsers({
            page: safePage,
            limit: safeLimit,
            status: 'ALL',
            auctionType: input.auctionType,
            categoryId: input.categoryId,
            sort: input.sort,
            order: input.order,
            search: input.search,
        });

        if (auctionsRes.isFailure) return Result.fail(auctionsRes.getError());

        const allAuctions = auctionsRes.getValue();

        const total = allAuctions.length;
        const totalPages = Math.max(1, Math.ceil(total / safeLimit));
        const currentPage = Math.min(safePage, totalPages);
        const start = (currentPage - 1) * safeLimit;
        const end = start + safeLimit;

        const auctions = allAuctions.slice(start, end).map((a) => {
            return AuctionMapperProrfile.toAuctionOutputDto(a);
        });

        return Result.ok({
            auctions,
            total,
            page: currentPage,
            limit: safeLimit,
            totalPages,
            currentPage,
        });
    }
}
