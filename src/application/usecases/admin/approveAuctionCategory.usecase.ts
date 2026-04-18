import {
    IApproveAuctionCategoryInputDto,
    IApproveAuctionCategoryOutputDto,
} from '@application/dtos/admin/approveAuctionCategory.dto';
import { IApproveAuctionCategoryUsecase } from '@application/interfaces/usecases/admin/IApproveAuctioncategoryUsecasse';
import { AdminMapperProfile } from '@application/mappers/admin/admin.mapper';
import { AuctionMapperProrfile } from '@application/mappers/auction/auction.mapperProfile';
import { TYPES } from '@di/types.di';
import { IAuctionCategoryRepository } from '@domain/repositories/IAuctionCategoryRepo';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class ApproveAuctionCategoryUsecase implements IApproveAuctionCategoryUsecase {
    constructor(
        @inject(TYPES.IAuctionCategoryRepository)
        private readonly _auctionCategoryRepository: IAuctionCategoryRepository,
    ) {}

    async execute(
        data: IApproveAuctionCategoryInputDto,
    ): Promise<Result<IApproveAuctionCategoryOutputDto>> {
        const dto = AdminMapperProfile.toApproveAuctionCategoryInputDto(data);
        const { categoryId } = dto;

        const categoryEntity =
            await this._auctionCategoryRepository.findById(categoryId);

        if (categoryEntity.isFailure) {
            return Result.fail(categoryEntity.getError());
        }

        const category = categoryEntity.getValue();
        if (!category) {
            return Result.fail('Auction category not found');
        }

        const approveResult = category.approveAuctionCategory();
        const verifyResult = category.verifyAuctionCategory();

        if (verifyResult.isFailure) {
            return Result.fail(verifyResult.getError());
        }

        if (approveResult.isFailure) {
            return Result.fail(approveResult.getError());
        }

        await this._auctionCategoryRepository.save(category);

        const output =
            AuctionMapperProrfile.toApproveAuctionCategoryOutputDto(category);

        return Result.ok(output);
    }
}
