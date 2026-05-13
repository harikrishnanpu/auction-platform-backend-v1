import { IAuctionDto } from '@application/dtos/auction/auction.dto';
import { IGetAuctionByAuctionNumberInputDto } from '@application/dtos/auction/getAuctionByAuctionNumber.dto';
import type { IGetAuctionByAuctionNumberUsecase } from '@application/interfaces/usecases/auction/IGetAuctionByAuctionNumberUsecase';
import { AuctionMapperProrfile } from '@application/mappers/auction/auction.mapperProfile';
import { AUCTION_MESSAGES } from '@application/constants/auction/auction.constants';
import { TYPES } from '@di/types.di';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class GetAuctionByAuctionNumberUsecase implements IGetAuctionByAuctionNumberUsecase {
    constructor(
        @inject(TYPES.IAuctionRepository)
        private readonly _auctionRepository: IAuctionRepository,
    ) {}

    async execute(
        input: IGetAuctionByAuctionNumberInputDto,
    ): Promise<Result<IAuctionDto>> {
        const dto = AuctionMapperProrfile.toGetAuctionByAuctionNumberDto(
            input.auctionNumber,
            input.userId,
        );
        const { auctionNumber, userId } = dto;

        const existing =
            await this._auctionRepository.findByAuctionNum(auctionNumber);
        if (existing.isFailure) {
            return Result.fail(existing.getError());
        }

        const auction = existing.getValue();
        if (!auction) {
            return Result.fail('Auction not found');
        }

        if (auction.getSellerId() !== userId) {
            return Result.fail(AUCTION_MESSAGES.NOT_AUTHORIZED_TO_VIEW_AUCTION);
        }

        const output = AuctionMapperProrfile.toAuctionOutputDto(auction);
        return Result.ok(output);
    }
}
