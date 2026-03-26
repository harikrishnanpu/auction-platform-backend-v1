import type {
    IGetUserParticipatedAuctionsInputDto,
    IGetUserParticipatedAuctionsOutputDto,
} from '@application/dtos/auction/get-user-participated-auctions.dto';
import type { IGetUserParticipatedAuctionsUsecase } from '@application/interfaces/usecases/auction/IGetUserParticipatedAuctionsUsecase';
import { AuctionMapperProrfile } from '@application/mappers/auction/auction.mapperProfile';
import { TYPES } from '@di/types.di';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class GetUserParticipatedAuctionsUsecase implements IGetUserParticipatedAuctionsUsecase {
    constructor(
        @inject(TYPES.IAuctionRepository)
        private readonly _auctionRepository: IAuctionRepository,
    ) {}

    async execute(
        input: IGetUserParticipatedAuctionsInputDto,
    ): Promise<Result<IGetUserParticipatedAuctionsOutputDto>> {
        const safePage = Number(input.page) > 0 ? Number(input.page) : 1;
        const safeLimit = Number(input.limit) > 0 ? Number(input.limit) : 10;

        const auctionsRes =
            await this._auctionRepository.findParticipatedByUserId(
                input.userId,
                {
                    status: input.status,
                    auctionType: input.auctionType,
                    page: safePage,
                    limit: safeLimit,
                    sort: input.sort,
                    order: input.order,
                    search: input.search,
                },
            );

        if (auctionsRes.isFailure) return Result.fail(auctionsRes.getError());

        const { auctions: filteredAuctions, total } = auctionsRes.getValue();
        const totalPages = Math.max(1, Math.ceil(total / safeLimit));
        const currentPage = Math.min(safePage, totalPages);
        const auctions = filteredAuctions.map((a) =>
            AuctionMapperProrfile.toAuctionOutputDto(a),
        );

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
