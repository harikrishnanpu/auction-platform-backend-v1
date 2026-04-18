import { ICreateAuctionCategoryOutputDto } from '@application/dtos/admin/createAuctionCategory.dto';
import { ICreateAuctionCategoryUsecase } from '@application/interfaces/usecases/admin/ICreateAuctionCategoryUsecase';
import { TYPES } from '@di/types.di';
import { IAuctionCategoryRepository } from '@domain/repositories/IAuctionCategoryRepo';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';
import { AuctionCategory } from '@domain/entities/auction/auction-category.entity';
import { AuctionCategorySlug } from '@domain/value-objects/auction-category-slug.vo';
import { AuctionCategoryStatus } from '@domain/entities/auction/auction-category.entity';
import { ISlugGeneratorService } from '@application/interfaces/services/ISlugGeneratorService';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { ZodCreateAuctionCategoryInputType } from '@presentation/validators/schemas/admin/createAuctionCategory.schema';
import { AdminMapperProfile } from '@application/mappers/admin/admin.mapper';

@injectable()
export class CreateAuctionCategoryUsecase implements ICreateAuctionCategoryUsecase {
    constructor(
        @inject(TYPES.IAuctionCategoryRepository)
        private readonly _auctionCategoryRepository: IAuctionCategoryRepository,
        @inject(TYPES.IIdGeneratingService)
        private readonly _idGeneratingService: IIdGeneratingService,
        @inject(TYPES.ISlugGeneratorService)
        private readonly _slugGeneratorService: ISlugGeneratorService,
    ) {}

    async execute(
        data: ZodCreateAuctionCategoryInputType,
    ): Promise<Result<ICreateAuctionCategoryOutputDto>> {
        console.log('data CAT', data);

        const dto = AdminMapperProfile.toCreateAuctionCategoryInputDto(data);
        const { name, parentId, userId } = dto;
        const generatedSlug = this._slugGeneratorService.generateSlug(name);

        const slugVo = AuctionCategorySlug.create(generatedSlug);
        if (slugVo.isFailure) return Result.fail(slugVo.getError()!);

        const existing = await this._auctionCategoryRepository.findBySlug(
            slugVo.getValue(),
        );

        if (existing.isFailure) return Result.fail(existing.getError());
        if (existing.getValue())
            return Result.fail('Auction category already exists');

        const createdEntity = AuctionCategory.create({
            id: this._idGeneratingService.generateId(),
            name: name,
            slug: slugVo.getValue(),
            parentId: parentId ?? null,
            isVerified: true,
            isActive: true,
            status: AuctionCategoryStatus.APPROVED,
            submittedBy: userId,
            rejectionReason: null,
        });

        if (createdEntity.isFailure) {
            return Result.fail(createdEntity.getError()!);
        }

        await this._auctionCategoryRepository.save(createdEntity.getValue());

        const cat = createdEntity.getValue();
        const output: ICreateAuctionCategoryOutputDto = {
            categoryId: cat.getId(),
            name: cat.getName(),
            parentId: cat.getParentId(),
        };

        return Result.ok(output);
    }
}
