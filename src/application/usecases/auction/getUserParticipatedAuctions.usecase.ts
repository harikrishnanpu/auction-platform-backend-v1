import type { IGetUserParticipatedAuctionsOutputDto } from '@application/dtos/auction/get-user-participated-auctions.dto';
import type { IGetUserParticipatedAuctionsUsecase } from '@application/interfaces/usecases/auction/IGetUserParticipatedAuctionsUsecase';
import { AuctionMapperProrfile } from '@application/mappers/auction/auction.mapperProfile';
import { TYPES } from '@di/types.di';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { Result } from '@domain/shared/result';
import { ZodGetUserParticipatedAuctionsInputType } from '@presentation/validators/schemas/auction/getUserParticipatedAuctionsInput.schema';
import { inject, injectable } from 'inversify';

@injectable()
export class GetUserParticipatedAuctionsUsecase implements IGetUserParticipatedAuctionsUsecase {
    constructor(
        @inject(TYPES.IAuctionRepository)
        private readonly _auctionRepository: IAuctionRepository,
    ) {}

    async execute(
        input: ZodGetUserParticipatedAuctionsInputType,
    ): Promise<Result<IGetUserParticipatedAuctionsOutputDto>> {
        const {
            userId,
            query: { page, limit, search, auctionType, status, sort, order },
        } = AuctionMapperProrfile.toGetUserParticipatedAuctionsInputDto(input);

        const safePage = Number(page) > 0 ? Number(page) : 1;
        const safeLimit = Number(limit) > 0 ? Number(limit) : 10;

        const auctionsRes =
            await this._auctionRepository.findParticipatedByUserId(userId, {
                status: status,
                auctionType: auctionType,
                page: safePage,
                limit: safeLimit,
                sort: sort,
                order: order,
                search: search,
            });

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
