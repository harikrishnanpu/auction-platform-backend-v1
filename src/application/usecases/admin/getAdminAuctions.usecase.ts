import type {
    IGetAdminAuctionsOutputDto,
    IGetAdminAuctionsUsecase,
    IValidatedGetAdminAuctionsInput,
} from '@application/interfaces/usecases/admin/IGetAdminAuctionsUsecase';
import { AuctionMapperProrfile } from '@application/mappers/auction/auction.mapperProfile';
import { TYPES } from '@di/types.di';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { AuctionStatus } from '@domain/entities/auction/auction.entity';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';
import { AdminMapperProfile } from '@application/mappers/admin/admin.mapper';

@injectable()
export class GetAdminAuctionsUsecase implements IGetAdminAuctionsUsecase {
    constructor(
        @inject(TYPES.IAuctionRepository)
        private readonly _auctionRepository: IAuctionRepository,
    ) {}

    async execute(
        input: IValidatedGetAdminAuctionsInput,
    ): Promise<Result<IGetAdminAuctionsOutputDto>> {
        const dto = AdminMapperProfile.toGetAdminAuctionsInputDto(input);

        const { page, limit, auctionType, categoryId, sort, order, search } =
            dto;

        const safePage = Number(page) > 0 ? page : 1;
        const safeLimit = Number(limit) > 0 ? limit : 10;

        const auctionsRes = await this._auctionRepository.findAll({
            page: safePage,
            limit: safeLimit,
            status: 'ALL',
            auctionType: auctionType,
            categoryId: categoryId,
            sort: sort,
            order: order,
            search: search,
        });

        if (auctionsRes.isFailure) {
            return Result.fail(auctionsRes.getError());
        }

        // Admin should see everything except DRAFT.
        const filtered = auctionsRes
            .getValue()
            .filter((a) => a.getStatus() !== AuctionStatus.DRAFT);

        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / safeLimit));
        const currentPage = Math.min(safePage, totalPages);
        const start = (currentPage - 1) * safeLimit;
        const end = start + safeLimit;

        const auctions = filtered.slice(start, end).map((a) => {
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
