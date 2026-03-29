import { ICreateAuctionInputDto } from '@application/dtos/auction/create-auction.dto';
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
import { IAuctionCategoryRepository } from '@domain/repositories/IAuctionCategoryRepo';
import { IAuctionDto } from '@application/dtos/auction/auction.dto';
import { AuctionCreatePolicyFactory } from '@application/factories/auctionCreatePolicy.factory';

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
    ) {}

    async execute(input: ICreateAuctionInputDto): Promise<Result<IAuctionDto>> {
        console.log('CREATE AUCTION INPUT: ', input);

        const validatedInput = this._auctionCreatePolicyFactory.validate(input);

        if (validatedInput.isFailure) {
            return Result.fail(validatedInput.getError());
        }

        const validatedAuctionInput = validatedInput.getValue();

        const categoryResult = await this._auctionCategoryRepository.findById(
            input.categoryId,
        );

        if (categoryResult.isFailure)
            return Result.fail(categoryResult.getError());

        const category = categoryResult.getValue();

        if (!category) {
            return Result.fail('Auction category not found');
        }

        const auctionId = this._idGeneratingService.generateId();

        const assets = validatedAuctionInput.assets.map((a, index) => {
            return AuctionAsset.create({
                id: this._idGeneratingService.generateId(),
                auctionId,
                fileKey: a.fileKey,
                position: a.position ?? index,
                assetType: a.assetType,
            });
        });

        const auctionResult = Auction.create({
            id: auctionId,
            sellerId: validatedAuctionInput.userId,
            auctionType: validatedAuctionInput.auctionType,
            title: input.title,
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
