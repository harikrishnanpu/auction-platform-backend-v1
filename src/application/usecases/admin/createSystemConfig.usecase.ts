import { ISystemConfigDto } from '@application/dtos/admin/systemConfig.dto';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { ICreateSystemConfigUsecase } from '@application/interfaces/usecases/admin/ICreateSystemConfigUsecase';
import { AdminMapperProfile } from '@application/mappers/admin/admin.mapper';
import { TYPES } from '@di/types.di';
import { SystemConfig } from '@domain/entities/system-config/system-config.entity';
import { ISystemConfigRepository } from '@domain/repositories/ISystemConfigRepository';
import { Result } from '@domain/shared/result';
import { ZodCreateSystemConfigInputType } from '@presentation/validators/schemas/admin/createSystemConfig.schema';
import { inject, injectable } from 'inversify';

@injectable()
export class CreateSystemConfigUsecase implements ICreateSystemConfigUsecase {
    constructor(
        @inject(TYPES.ISystemConfigRepository)
        private readonly _systemConfigRepository: ISystemConfigRepository,
        @inject(TYPES.IIdGeneratingService)
        private readonly _idGeneratingService: IIdGeneratingService,
    ) {}

    async execute(
        input: ZodCreateSystemConfigInputType,
    ): Promise<Result<ISystemConfigDto>> {
        const dto = AdminMapperProfile.toCreateSystemConfigInputDto(input);

        const existingResult = await this._systemConfigRepository.findByKey(
            dto.key,
        );
        if (existingResult.isFailure)
            return Result.fail(existingResult.getError());
        if (existingResult.getValue()) {
            return Result.fail('System config already exists');
        }

        const config = SystemConfig.create({
            id: this._idGeneratingService.generateId(),
            key: dto.key,
            value: dto.value,
            description: dto.description ?? null,
        });

        if (config.isFailure) return Result.fail(config.getError());

        const result = await this._systemConfigRepository.save(
            config.getValue(),
        );
        if (result.isFailure) return Result.fail(result.getError());

        const configResult = result.getValue();
        return Result.ok({
            id: configResult.getId(),
            key: configResult.getKey(),
            value: configResult.getValue(),
            description: configResult.getDescription(),
            createdAt: configResult.getCreatedAt(),
            updatedAt: configResult.getUpdatedAt(),
        });
    }
}
