import type {
    IGetAuctionBidsInputDto,
    IGetAuctionBidsOutputDto,
} from '@application/dtos/auction/getAuctionBids.dto';
import type { IGetAuctionBidsUsecase } from '@application/interfaces/usecases/auction/IGetAuctionBidsUsecase';
import { TYPES } from '@di/types.di';
import { AuctionStatus } from '@domain/entities/auction/auction.entity';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { IBidRepository } from '@domain/repositories/IBidRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class GetAuctionBidsUsecase implements IGetAuctionBidsUsecase {
    constructor(
        @inject(TYPES.IAuctionRepository)
        private readonly _auctionRepository: IAuctionRepository,
        @inject(TYPES.IBidRepository)
        private readonly _bidRepository: IBidRepository,
    ) {}

    async execute(
        input: IGetAuctionBidsInputDto,
    ): Promise<Result<IGetAuctionBidsOutputDto>> {
        const auctionResult = await this._auctionRepository.findById(
            input.auctionId,
        );

        if (auctionResult.isFailure) {
            return Result.fail(auctionResult.getError());
        }

        const auction = auctionResult.getValue();

        if (!auction) {
            return Result.fail('Auction not found');
        }

        if (auction.getStatus() === AuctionStatus.DRAFT) {
            return Result.fail('Auction is not available');
        }

        const bidsResult = await this._bidRepository.findAllByAuctionId(
            input.auctionId,
        );

        if (bidsResult.isFailure) {
            return Result.fail(bidsResult.getError());
        }

        const bids = bidsResult.getValue().map((b) => ({
            id: b.getId(),
            auctionId: b.getAuctionId(),
            userId: b.getUserId(),
            amount: b.getAmount(),
            createdAt: b.getCreatedAt().toISOString(),
        }));

        return Result.ok({
            bids,
            total: bids.length,
        });
    }
}
