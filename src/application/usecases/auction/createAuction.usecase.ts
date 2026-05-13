import { ICreateAuctionUsecase } from '@application/interfaces/usecases/auction/ICreateAuctionUsecase';

import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { TYPES } from '@di/types.di';
import {
    Auction,
    AuctionStatus,
} from '@domain/entities/auction/auction.entity';
import { AuctionAsset } from '@domain/entities/auction/auction-asset.entity';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';
import { AuctionMapperProrfile } from '@application/mappers/auction/auction.mapperProfile';
import { validateAuctionDraftPricingWithSystemConfig } from '@application/helpers/validateAuctionDraftPricingWithSystemConfig';
import { IAuctionCategoryRepository } from '@domain/repositories/IAuctionCategoryRepo';
import { IAuctionDto } from '@application/dtos/auction/auction.dto';
import { AuctionCreatePolicyFactory } from '@application/factories/auctionCreatePolicy.factory';
import { ICreateAuctionInputDto } from '@application/dtos/auction/create-auction.dto';
import { ISubscriptionConfigService } from '@application/interfaces/services/ISubscriptionConfigService';
import { IAuctionNumberGeneratingService } from '@application/interfaces/services/IAuctionNumberGeneratingService';
import { ISystemConfigService } from '@application/interfaces/services/ISystemConfigService';

@injectable()
export class CreateAuctionUsecase implements ICreateAuctionUsecase {
    constructor(
        @inject(TYPES.IAuctionRepository)
        private readonly _auctionRepository: IAuctionRepository,
        @inject(TYPES.IIdGeneratingService)
        private readonly _idGeneratingService: IIdGeneratingService,
        @inject(TYPES.IAuctionCategoryRepository)
        private readonly _auctionCategoryRepository: IAuctionCategoryRepository,
        @inject(TYPES.AuctionCreatePolicyFactory)
        private readonly _auctionCreatePolicyFactory: AuctionCreatePolicyFactory,
        @inject(TYPES.ISubscriptionConfigService)
        private readonly _subscriptionConfigService: ISubscriptionConfigService,
        @inject(TYPES.IAuctionNumberGeneratingService)
        private readonly _auctionNumberGeneratingService: IAuctionNumberGeneratingService,
        @inject(TYPES.ISystemConfigService)
        private readonly _systemConfigService: ISystemConfigService,
    ) {}

    async execute(data: ICreateAuctionInputDto): Promise<Result<IAuctionDto>> {
        console.log('CREATE AUCTION INPUT: ', data);

        const dto = AuctionMapperProrfile.toCreateAuctionDto(data);

        const validatedInput = this._auctionCreatePolicyFactory.validate(dto);

        if (validatedInput.isFailure) {
            return Result.fail(validatedInput.getError());
        }

        const validatedAuctionInput = validatedInput.getValue();

        const canCreateAuctionResult =
            await this._subscriptionConfigService.canCreateAuction(
                validatedAuctionInput.userId,
            );
        if (canCreateAuctionResult.isFailure) {
            return Result.fail(canCreateAuctionResult.getError());
        }

        if (!canCreateAuctionResult.getValue()) {
            return Result.fail(
                'You have reached the maximum number of auctions you can create with your subscription plan',
            );
        }

        const categoryResult = await this._auctionCategoryRepository.findById(
            validatedAuctionInput.categoryId,
        );

        if (categoryResult.isFailure)
            return Result.fail(categoryResult.getError());

        const category = categoryResult.getValue();

        if (!category) {
            return Result.fail('Auction category not found');
        }

        const auctionId = this._idGeneratingService.generateId();
        const auctionNumber =
            this._auctionNumberGeneratingService.generateAuctionNumber();

        const assets = validatedAuctionInput.assets.map((a, index) => {
            return AuctionAsset.create({
                id: this._idGeneratingService.generateId(),
                auctionId,
                fileKey: a.fileKey,
                position: a.position ?? index,
                assetType: a.assetType,
            });
        });

        const pricingOk = await validateAuctionDraftPricingWithSystemConfig(
            this._systemConfigService,
            {
                startPrice: validatedAuctionInput.startPrice,
                maxExtensionCount: validatedAuctionInput.maxExtensionCount,
            },
        );
        if (pricingOk.isFailure) {
            return Result.fail(pricingOk.getError());
        }

        const auctionResult = Auction.create({
            id: auctionId,
            auctionNumber: auctionNumber,
            sellerId: validatedAuctionInput.userId,
            auctionType: validatedAuctionInput.auctionType,
            title: validatedAuctionInput.title,
            description: validatedAuctionInput.description,
            category: category,
            condition: validatedAuctionInput.condition,
            startPrice: validatedAuctionInput.startPrice,
            minIncrement: validatedAuctionInput.minIncrement,
            startAt: validatedAuctionInput.startAt,
            endAt: validatedAuctionInput.endAt,
            status: AuctionStatus.DRAFT,
            antiSnipSeconds: validatedAuctionInput.antiSnipSeconds,
            maxExtensionCount: validatedAuctionInput.maxExtensionCount,
            bidCooldownSeconds: validatedAuctionInput.bidCooldownSeconds,
            assets: assets,
        });

        if (auctionResult.isFailure)
            return Result.fail(auctionResult.getError());
        const auction = auctionResult.getValue();

        const savedResult = await this._auctionRepository.save(auction);
        if (savedResult.isFailure) return Result.fail(savedResult.getError());

        const saved = savedResult.getValue();

        const output: IAuctionDto =
            AuctionMapperProrfile.toAuctionOutputDto(saved);

        return Result.ok(output);
    }
}
