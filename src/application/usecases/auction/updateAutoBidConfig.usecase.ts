import {
    IAutoBidConfigOutputDto,
    IUpdateAutoBidConfigInputDto,
} from '@application/dtos/auction/autoBidConfig.dto';
import { IUpdateAutoBidConfigUsecase } from '@application/interfaces/usecases/auction/IUpdateAutoBidConfigUsecase';
import { TYPES } from '@di/types.di';
import { AuctionType } from '@domain/entities/auction/auction.entity';
import { IAutoBidConfigRepository } from '@domain/repositories/IAutoBidConfigRepository';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class UpdateAutoBidConfigUsecase implements IUpdateAutoBidConfigUsecase {
    constructor(
        @inject(TYPES.IAutoBidConfigRepository)
        private readonly _autoBidConfigRepository: IAutoBidConfigRepository,
        @inject(TYPES.IAuctionRepository)
        private readonly _auctionRepository: IAuctionRepository,
    ) {}

    async execute(
        input: IUpdateAutoBidConfigInputDto,
    ): Promise<Result<IAutoBidConfigOutputDto>> {
        const auctionResult = await this._auctionRepository.findById(
            input.auctionId,
        );
        if (auctionResult.isFailure)
            return Result.fail(auctionResult.getError());
        if (auctionResult.getValue().getAuctionType() !== AuctionType.LONG) {
            return Result.fail('Auto bid is supported only for long auctions');
        }

        const existingResult =
            await this._autoBidConfigRepository.findByUserAndAuction(
                input.userId,
                input.auctionId,
            );
        if (existingResult.isFailure)
            return Result.fail(existingResult.getError());
        const existing = existingResult.getValue();
        if (!existing) return Result.fail('Auto bid config not found');

        const updateResult = existing.updateConfig({
            strategy: input.strategy,
            maxBidAmount: input.maxBidAmount,
            isActive: true,
        });
        if (updateResult.isFailure) return Result.fail(updateResult.getError());

        const saved = await this._autoBidConfigRepository.save(existing);
        if (saved.isFailure) return Result.fail(saved.getError());
        const value = saved.getValue();
        return Result.ok({
            id: value.getId(),
            strategy: value.getStrategy(),
            maxBidAmount: value.getMaxBidAmount(),
            isActive: value.getIsActive(),
        });
    }
}
