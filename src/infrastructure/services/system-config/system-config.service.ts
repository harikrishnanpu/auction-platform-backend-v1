import { ISystemConfigDto } from '@application/dtos/admin/systemConfig.dto';
import { ISystemConfigService } from '@application/interfaces/services/ISystemConfigService';
import { TYPES } from '@di/types.di';
import {
    SystemConfig,
    SystemConfigKey,
    SystemConfigValueType,
} from '@domain/entities/system-config/system-config.entity';
import { ISystemConfigRepository } from '@domain/repositories/ISystemConfigRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class SystemConfigService implements ISystemConfigService {
    constructor(
        @inject(TYPES.ISystemConfigRepository)
        private readonly _systemConfigRepository: ISystemConfigRepository,
    ) {}

    async getConfigByKey(
        key: SystemConfigKey,
    ): Promise<Result<ISystemConfigDto>> {
        const configResult = await this._systemConfigRepository.findByKey(key);
        if (configResult.isFailure) return Result.fail(configResult.getError());

        const config = configResult.getValue();
        if (!config) {
            return Result.fail('System config not found');
        }

        return this.toDto(config);
    }

    private toDto(config: SystemConfig): Result<ISystemConfigDto> {
        const valueType = config.getValueType();
        let value: string | number | boolean = config.getValue();

        switch (valueType) {
            case SystemConfigValueType.NUMBER:
                value = Number(value);
                break;
            case SystemConfigValueType.BOOLEAN:
                value = Boolean(value);
                break;
        }

        return Result.ok({
            id: config.getId(),
            key: config.getKey(),
            value: value,
            valueType: config.getValueType(),
            description: config.getDescription(),
            createdAt: config.getCreatedAt(),
            updatedAt: config.getUpdatedAt(),
        });
    }
}
