import {
    IAutoBidConfigOutputDto,
    ICreateAutoBidConfigInputDto,
} from '@application/dtos/auction/autoBidConfig.dto';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { ICreateAutoBidConfigUsecase } from '@application/interfaces/usecases/auction/ICreateAutoBidConfigUsecase';
import { TYPES } from '@di/types.di';
import {
    AuctionStatus,
    AuctionType,
} from '@domain/entities/auction/auction.entity';
import { AutoBidConfig } from '@domain/entities/auction/auto-bid-config.entity';
import { IAutoBidConfigRepository } from '@domain/repositories/IAutoBidConfigRepository';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class CreateAutoBidConfigUsecase implements ICreateAutoBidConfigUsecase {
    constructor(
        @inject(TYPES.IAutoBidConfigRepository)
        private readonly _autoBidConfigRepository: IAutoBidConfigRepository,
        @inject(TYPES.IAuctionRepository)
        private readonly _auctionRepository: IAuctionRepository,
        @inject(TYPES.IIdGeneratingService)
        private readonly _idGeneratingService: IIdGeneratingService,
    ) {}

    async execute(
        input: ICreateAutoBidConfigInputDto,
    ): Promise<Result<IAutoBidConfigOutputDto>> {
        const auctionResult = await this._auctionRepository.findById(
            input.auctionId,
        );
        if (auctionResult.isFailure)
            return Result.fail(auctionResult.getError());

        console.log('AUCTION RESULT: ', auctionResult.getValue());

        const auction = auctionResult.getValue();
        if (!auction) {
            return Result.fail('Auction not found');
        }

        if (auction.getStatus() !== AuctionStatus.ACTIVE) {
            return Result.fail('Auto bid: support only for active');
        }

        if (auction.getAuctionType() !== AuctionType.LONG) {
            return Result.fail('Auto bid is supported only for long auctions');
        }

        const existingResult =
            await this._autoBidConfigRepository.findByUserAndAuction(
                input.userId,
                input.auctionId,
            );
        if (existingResult.isFailure)
            return Result.fail(existingResult.getError());
        if (existingResult.getValue()) {
            return Result.fail(
                'Auto bid config already exists for this auction',
            );
        }

        const created = AutoBidConfig.create({
            id: this._idGeneratingService.generateId(),
            userId: input.userId,
            auctionId: input.auctionId,
            maxBidAmount: input.maxBidAmount,
            strategy: input.strategy,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        if (created.isFailure) return Result.fail(created.getError());

        const saved = await this._autoBidConfigRepository.save(
            created.getValue(),
        );
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
