import {
    IFailAuctionInputDto,
    IFailAuctionOutputDto,
} from '@application/dtos/auction/fail-auction.dto';
import { IFailAuctionUsecase } from '@application/interfaces/usecases/auction/IFailAuctionUsecase';
import { TYPES } from '@di/types.di';
import { AuctionStatus } from '@domain/entities/auction/auction.entity';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class FailAuctionUsecase implements IFailAuctionUsecase {
    constructor(
        @inject(TYPES.IAuctionRepository)
        private readonly _auctionRepository: IAuctionRepository,
    ) {}

    async execute(
        input: IFailAuctionInputDto,
    ): Promise<Result<IFailAuctionOutputDto>> {
        const auctionEntity = await this._auctionRepository.findById(
            input.auctionId,
        );

        if (auctionEntity.isFailure) {
            return Result.fail('Auction not found');
        }

        const auction = auctionEntity.getValue();

        const setStatusResult = auction.setStatus(AuctionStatus.FAILED);
        if (setStatusResult.isFailure) {
            return Result.fail(setStatusResult.getError());
        }

        const saveResult = await this._auctionRepository.save(auction);
        if (saveResult.isFailure) {
            return Result.fail(saveResult.getError());
        }

        return Result.ok({
            auctionId: auction.getId(),
            status: auction.getStatus(),
        });
    }
}
