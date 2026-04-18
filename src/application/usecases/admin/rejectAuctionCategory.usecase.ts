import { IRejectAuctionCategoryrequestOutputDto } from '@application/dtos/admin/rejectAuctionCategory.dto';
import { IRejectAuctionCategoryrequestUsecase } from '@application/interfaces/usecases/admin/IRejectAuctionCategoryrequestusecase';
import { AdminMapperProfile } from '@application/mappers/admin/admin.mapper';
import { AuctionMapperProrfile } from '@application/mappers/auction/auction.mapperProfile';
import { TYPES } from '@di/types.di';
import { IAuctionCategoryRepository } from '@domain/repositories/IAuctionCategoryRepo';
import { Result } from '@domain/shared/result';
import { ZodRejectAuctionCategoryInputType } from '@presentation/validators/schemas/admin/rejectAuctionCategory.schema';
import { inject } from 'inversify';

export class RejectAuctionCategoryUsecase implements IRejectAuctionCategoryrequestUsecase {
    constructor(
        @inject(TYPES.IAuctionCategoryRepository)
        private readonly _auctionCategoryRepository: IAuctionCategoryRepository,
    ) {}

    async execute(
        data: ZodRejectAuctionCategoryInputType,
    ): Promise<Result<IRejectAuctionCategoryrequestOutputDto>> {
        const dto = AdminMapperProfile.toRejectAuctionCategoryInputDto(data);
        const { categoryId, reason } = dto;

        const categoryEntity =
            await this._auctionCategoryRepository.findById(categoryId);
        if (categoryEntity.isFailure) {
            return Result.fail(categoryEntity.getError());
        }

        const category = categoryEntity.getValue();
        if (!category) {
            return Result.fail('Auction category not found');
        }

        category.rejectAuctionCategory(reason);
        await this._auctionCategoryRepository.save(category);

        const output =
            AuctionMapperProrfile.toRejectAuctionCategoryResponseDto(category);
        return Result.ok(output);
    }
}
