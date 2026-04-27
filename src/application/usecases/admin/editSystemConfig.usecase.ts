import { ISystemConfigDto } from '@application/dtos/admin/systemConfig.dto';
import { IEditSystemConfigUsecase } from '@application/interfaces/usecases/admin/IEditSystemConfigUsecase';
import { AdminMapperProfile } from '@application/mappers/admin/admin.mapper';
import { TYPES } from '@di/types.di';
import { SystemConfig } from '@domain/entities/system-config/system-config.entity';
import { ISystemConfigRepository } from '@domain/repositories/ISystemConfigRepository';
import { Result } from '@domain/shared/result';
import { ZodEditSystemConfigInputType } from '@presentation/validators/schemas/admin/editSystemConfig.schema';
import { inject, injectable } from 'inversify';

@injectable()
export class EditSystemConfigUsecase implements IEditSystemConfigUsecase {
    constructor(
        @inject(TYPES.ISystemConfigRepository)
        private readonly _systemConfigRepository: ISystemConfigRepository,
    ) {}

    async execute(
        input: ZodEditSystemConfigInputType,
    ): Promise<Result<ISystemConfigDto>> {
        const dto = AdminMapperProfile.toEditSystemConfigInputDto(input);

        const existingResult = await this._systemConfigRepository.findByKey(
            dto.key,
        );
        if (existingResult.isFailure)
            return Result.fail(existingResult.getError());

        const existingConfig = existingResult.getValue();
        if (!existingConfig) {
            return Result.fail('System config not found');
        }

        const config = SystemConfig.create({
            id: existingConfig.getId(),
            key: dto.key,
            value: dto.value,
            description: dto.description ?? null,
            createdAt: existingConfig.getCreatedAt(),
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
