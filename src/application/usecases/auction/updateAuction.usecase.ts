import { AUCTION_MESSAGES } from '@application/constants/auction/auction.constants';
import { IUpdateAuctionOutput } from '@application/dtos/auction/update-auction.dto';
import {
    IUpdateAuctionUsecase,
    IValidatedUpdateAuctionInput,
} from '@application/interfaces/usecases/auction/IUpdateAuctionUsecase';

import { TYPES } from '@di/types.di';
import { IAuctionCategoryRepository } from '@domain/repositories/IAuctionCategoryRepo';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { ISystemConfigService } from '@application/interfaces/services/ISystemConfigService';
import {
    Auction,
    AuctionStatus,
} from '@domain/entities/auction/auction.entity';
import {
    AuctionAsset,
    AuctionAssetType,
} from '@domain/entities/auction/auction-asset.entity';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';
import { AuctionMapperProrfile } from '@application/mappers/auction/auction.mapperProfile';
import { validateAuctionDraftPricingWithSystemConfig } from '@application/helpers/validateAuctionDraftPricingWithSystemConfig';

@injectable()
export class UpdateAuctionUsecase implements IUpdateAuctionUsecase {
    constructor(
        @inject(TYPES.IAuctionRepository)
        private readonly _auctionRepository: IAuctionRepository,
        @inject(TYPES.IAuctionCategoryRepository)
        private readonly _auctionCategoryRepository: IAuctionCategoryRepository,
        @inject(TYPES.IIdGeneratingService)
        private readonly _idGeneratingService: IIdGeneratingService,
        @inject(TYPES.ISystemConfigService)
        private readonly _systemConfigService: ISystemConfigService,
    ) {}

    async execute(
        input: IValidatedUpdateAuctionInput,
    ): Promise<Result<IUpdateAuctionOutput>> {
        console.log('UPDATE AUCTION INPUT: ', input);

        const dto = AuctionMapperProrfile.toUpdateAuctionInputDto(input);
        const { auctionId } = dto;

        const existing = await this._auctionRepository.findById(auctionId);

        if (existing.isFailure) {
            return Result.fail(existing.getError());
        }

        const auction = existing.getValue();

        if (!auction) {
            return Result.fail('Auction not found');
        }

        if (auction.getSellerId() !== dto.userId) {
            return Result.fail(AUCTION_MESSAGES.NOT_AUTHORIZED_TO_UPDATE);
        }

        if (auction.getStatus() !== AuctionStatus.DRAFT) {
            return Result.fail(AUCTION_MESSAGES.ONLY_DRAFT_CAN_BE_UPDATED);
        }

        const categoryResult = await this._auctionCategoryRepository.findById(
            dto.category,
        );
        if (categoryResult.isFailure)
            return Result.fail(categoryResult.getError());
        const category = categoryResult.getValue();
        if (!category) return Result.fail('Auction category not found');

        const assets =
            dto.assets && dto.assets.length > 0
                ? dto.assets.map((a, idx) =>
                      AuctionAsset.create({
                          id: this._idGeneratingService.generateId(),
                          auctionId: auction.getId(),
                          fileKey: a.fileKey,
                          position: a.position ?? idx,
                          assetType: a.assetType ?? AuctionAssetType.IMAGE,
                      }),
                  )
                : auction.getAssets();

        const maxExt = dto.maxExtensionCount ?? auction.getMaxExtensionCount();
        const pricingOk = await validateAuctionDraftPricingWithSystemConfig(
            this._systemConfigService,
            {
                startPrice: dto.startPrice,
                maxExtensionCount: maxExt,
            },
        );
        if (pricingOk.isFailure) {
            return Result.fail(pricingOk.getError());
        }

        const updatedResult = Auction.create({
            id: auction.getId(),
            auctionNumber: auction.getAuctionNumber(),
            sellerId: auction.getSellerId(),
            auctionType: dto.auctionType ?? auction.getAuctionType(),
            title: dto.title,
            description: dto.description,
            category,
            condition: dto.condition,
            startPrice: dto.startPrice,
            minIncrement: dto.minIncrement,
            startAt: dto.startAt,
            endAt: dto.endAt,
            status: AuctionStatus.DRAFT,
            antiSnipSeconds:
                dto.antiSnipSeconds ?? auction.getAntiSnipSeconds(),
            extensionCount: auction.getExtensionCount(),
            maxExtensionCount: maxExt,
            bidCooldownSeconds:
                dto.bidCooldownSeconds ?? auction.getBidCooldownSeconds(),
            winnerId: auction.getWinnerId(),
            assets,
        });

        if (updatedResult.isFailure) {
            return Result.fail(updatedResult.getError());
        }

        const updated = updatedResult.getValue();

        const updateResult = await this._auctionRepository.save(updated);

        if (updateResult.isFailure) return Result.fail(updateResult.getError());

        const saved = updateResult.getValue();

        const output = AuctionMapperProrfile.toAuctionOutputDto(saved);

        return Result.ok({ auction: output });
    }
}
