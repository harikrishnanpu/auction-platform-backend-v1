import { ISystemConfigDto } from '@application/dtos/admin/systemConfig.dto';
import {
    IEditSystemConfigUsecase,
    IValidatedEditSystemConfigInput,
} from '@application/interfaces/usecases/admin/IEditSystemConfigUsecase';

import { AdminMapperProfile } from '@application/mappers/admin/admin.mapper';
import { TYPES } from '@di/types.di';
import {
    SystemConfig,
    SystemConfigValueType,
} from '@domain/entities/system-config/system-config.entity';
import { ISystemConfigRepository } from '@domain/repositories/ISystemConfigRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';
import { ISystemConfigService } from '@application/interfaces/services/ISystemConfigService';

@injectable()
export class EditSystemConfigUsecase implements IEditSystemConfigUsecase {
    constructor(
        @inject(TYPES.ISystemConfigRepository)
        private readonly _systemConfigRepository: ISystemConfigRepository,
        @inject(TYPES.ISystemConfigService)
        private readonly _systemConfigService: ISystemConfigService,
    ) {}

    async execute(
        input: IValidatedEditSystemConfigInput,
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

        switch (existingConfig.getValueType()) {
            case SystemConfigValueType.NUMBER:
                if (isNaN(Number(dto.value))) {
                    return Result.fail('Invalid value: neeed number');
                }
                break;
            case SystemConfigValueType.BOOLEAN:
                if (!['true', 'false'].includes(dto.value.toLowerCase())) {
                    return Result.fail('Invalid value: need boolean');
                }
                break;
            case SystemConfigValueType.STRING:
                break;
            default:
                return Result.fail('Invalid value type');
        }

        const config = SystemConfig.create({
            id: existingConfig.getId(),
            key: dto.key,
            value: dto.value,
            valueType: existingConfig.getValueType(),
            description: dto.description,
            createdAt: existingConfig.getCreatedAt(),
        });

        if (config.isFailure) return Result.fail(config.getError());

        const result = await this._systemConfigRepository.save(
            config.getValue(),
        );
        if (result.isFailure) return Result.fail(result.getError());

        await this._systemConfigService.revalidateChache(dto.key);

        const outputDto = AdminMapperProfile.toSystemConfigDto(
            result.getValue(),
        );

        return Result.ok(outputDto);
    }
}
