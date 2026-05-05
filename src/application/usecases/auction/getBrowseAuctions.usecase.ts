import type {
    IGetBrowseAuctionsOutputDto,
    IGetBrowseAuctionsUsecase,
} from '@application/interfaces/usecases/auction/IGetBrowseAuctionsUsecase';
import { AuctionMapperProrfile } from '@application/mappers/auction/auction.mapperProfile';
import { TYPES } from '@di/types.di';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { Result } from '@domain/shared/result';
import { ZodGetBrowseAuctionsInputType } from '@presentation/validators/schemas/auction/getBrowseAuctions.schema';
import { inject, injectable } from 'inversify';

@injectable()
export class GetBrowseAuctionsUsecase implements IGetBrowseAuctionsUsecase {
    constructor(
        @inject(TYPES.IAuctionRepository)
        private readonly _auctionRepository: IAuctionRepository,
    ) {}

    async execute(
        data: ZodGetBrowseAuctionsInputType,
    ): Promise<Result<IGetBrowseAuctionsOutputDto>> {
        const dto = AuctionMapperProrfile.toGetBrowseAuctionsDto(data);

        const {
            page,
            limit,
            auctionType,
            categoryId,
            sort,
            order,
            search,
            scope,
        } = dto;

        const safePage = Number(page) > 0 ? page : 1;
        const safeLimit = Number(limit) > 0 ? limit : 10;

        const auctionsRes = await this._auctionRepository.findAllForUsers({
            page: safePage,
            limit: safeLimit,
            status: 'ALL',
            auctionType: auctionType,
            categoryId: categoryId,
            sort: sort,
            order: order,
            search: search,
            scope: scope ?? 'default',
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
