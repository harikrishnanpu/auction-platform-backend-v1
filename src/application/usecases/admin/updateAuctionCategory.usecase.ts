import { IUpdateAuctionCategoryOutputDto } from '@application/dtos/admin/updateAuctionCategory.dto';
import { IUpdateAuctionCategoryUsecase } from '@application/interfaces/usecases/admin/IUpdateAuctioncategoryUsecase';
import { AdminMapperProfile } from '@application/mappers/admin/admin.mapper';
import { AuctionMapperProrfile } from '@application/mappers/auction/auction.mapperProfile';
import { TYPES } from '@di/types.di';
import { IAuctionCategoryRepository } from '@domain/repositories/IAuctionCategoryRepo';
import { Result } from '@domain/shared/result';
import { ZodUpdateAuctionCategoryInputType } from '@presentation/validators/schemas/admin/updateAuctionCategory.schema';
import { inject, injectable } from 'inversify';

@injectable()
export class UpdateAuctionCategoryUsecase implements IUpdateAuctionCategoryUsecase {
    constructor(
        @inject(TYPES.IAuctionCategoryRepository)
        private readonly _auctionCategoryRepository: IAuctionCategoryRepository,
    ) {}

    async execute(
        data: ZodUpdateAuctionCategoryInputType,
    ): Promise<Result<IUpdateAuctionCategoryOutputDto>> {
        const dto = AdminMapperProfile.toUpdateAuctionCategoryInputDto(data);
        const { categoryId, name, parentId } = dto;

        const categoryEntity =
            await this._auctionCategoryRepository.findById(categoryId);

        if (categoryEntity.isFailure) {
            return Result.fail(categoryEntity.getError());
        }

        const category = categoryEntity.getValue();
        if (!category) {
            return Result.fail('Auction category not found');
        }

        category.setName(name);
        category.setParentId(parentId);

        await this._auctionCategoryRepository.save(category);

        const output =
            AuctionMapperProrfile.toUpdateAuctionCategoryResponseDto(category);

        return Result.ok(output);
    }
}
