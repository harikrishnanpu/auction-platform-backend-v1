import { ISystemConfigService } from '@application/interfaces/services/ISystemConfigService';
import { TYPES } from '@di/types.di';
import { SystemConfigKey } from '../../../domain/constants/systemConfig.constants';
import { ISystemConfigRepository } from '@domain/repositories/ISystemConfigRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class SystemConfigService implements ISystemConfigService {
    constructor(
        @inject(TYPES.ISystemConfigRepository)
        private readonly _systemConfigRepository: ISystemConfigRepository,
    ) {}

    async getString(
        key: SystemConfigKey,
        fallbackValue?: string,
    ): Promise<Result<string>> {
        const configResult = await this._systemConfigRepository.findByKey(key);
        if (configResult.isFailure) return Result.fail(configResult.getError());

        const config = configResult.getValue();
        if (!config) {
            if (fallbackValue !== undefined) return Result.ok(fallbackValue);
            return Result.fail('System config not found');
        }

        return Result.ok(config.getValue());
    }

    async getNumber(
        key: SystemConfigKey,
        fallbackValue?: number,
    ): Promise<Result<number>> {
        const valueResult = await this.getString(
            key,
            fallbackValue !== undefined ? String(fallbackValue) : undefined,
        );
        if (valueResult.isFailure) return Result.fail(valueResult.getError());

        const parsed = Number(valueResult.getValue());
        if (Number.isNaN(parsed)) {
            return Result.fail(`System config must be a number`);
        }

        return Result.ok(parsed);
    }
}
