import { IGetAllAuctionsOutputDto } from '@application/dtos/auction/getAllAuction.dto';
import {
    IGetAllSellerAuctionsUsecase,
    IValidatedGetAllSellerAuctionsInput,
} from '@application/interfaces/usecases/seller/IGetallAuctionsUsecase';

import { AuctionMapperProrfile } from '@application/mappers/auction/auction.mapperProfile';
import { TYPES } from '@di/types.di';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';
import { SellerMapperProfile } from '@infrastructure/mappers/seller/seller.mapper';

@injectable()
export class GetAllSellerAuctionsUsecase implements IGetAllSellerAuctionsUsecase {
    constructor(
        @inject(TYPES.IAuctionRepository)
        private readonly _auctionRepository: IAuctionRepository,
    ) {}

    async execute(
        input: IValidatedGetAllSellerAuctionsInput,
    ): Promise<Result<IGetAllAuctionsOutputDto>> {
        const dto = SellerMapperProfile.toGetAllAuctionsInputDto(input);

        const safePage = Number(dto.page) > 0 ? dto.page : 1;
        const safeLimit = Number(dto.limit) > 0 ? dto.limit : 10;

        const pageRes = await this._auctionRepository.findSellerAuctionsPage({
            sellerId: dto.userId,
            status: dto.status,
            auctionType: dto.auctionType,
            categoryId: dto.categoryId,
            sort: dto.sort,
            order: dto.order,
            search: dto.search,
            page: safePage,
            limit: safeLimit,
        });

        if (pageRes.isFailure) {
            return Result.fail(pageRes.getError());
        }

        const { total, auctions, page: currentPage } = pageRes.getValue();
        const totalPages = Math.max(1, Math.ceil(total / safeLimit));

        const auctionsResult = auctions.map((a) =>
            AuctionMapperProrfile.toAuctionOutputDto(a),
        );

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
