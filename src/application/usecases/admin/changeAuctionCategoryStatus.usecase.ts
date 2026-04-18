import {
    IChangeAuctionCategoryStatusInputDto,
    IChangeAuctionCategoryStatusOutputDto,
} from '@application/dtos/admin/changeAuctionCategoryStatus.dto';
import { IChangeAuctionCategoryStatusUsecase } from '@application/interfaces/usecases/admin/IChangeAuctionCategoyUsecase';
import { AdminMapperProfile } from '@application/mappers/admin/admin.mapper';
import { TYPES } from '@di/types.di';
import { IAuctionCategoryRepository } from '@domain/repositories/IAuctionCategoryRepo';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class ChangeAuctionCategoryStatusUsecase implements IChangeAuctionCategoryStatusUsecase {
    constructor(
        @inject(TYPES.IAuctionCategoryRepository)
        private readonly _auctionCategoryRepository: IAuctionCategoryRepository,
    ) {}

    async execute(
        data: IChangeAuctionCategoryStatusInputDto,
    ): Promise<Result<IChangeAuctionCategoryStatusOutputDto>> {
        const dto =
            AdminMapperProfile.toChangeAuctionCategoryStatusInputDto(data);
        const { categoryId, status } = dto;

        const categoryEntity =
            await this._auctionCategoryRepository.findById(categoryId);

        if (categoryEntity.isFailure) {
            return Result.fail(categoryEntity.getError());
        }

        const category = categoryEntity.getValue();
        if (!category) {
            return Result.fail('Auction category not found');
        }

        category.changeActiveStatus(status);
        await this._auctionCategoryRepository.save(category);

        const output: IChangeAuctionCategoryStatusOutputDto = {
            categoryId,
            status: category.getIsActive(),
        };

        return Result.ok(output);
    }
}
