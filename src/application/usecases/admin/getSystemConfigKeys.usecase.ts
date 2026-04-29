import { IGetSystemConfigKeysOutputDto } from '@application/dtos/admin/systemConfig.dto';
import { IGetSystemConfigKeysUsecase } from '@application/interfaces/usecases/admin/IGetSystemConfigKeysUsecase';
import { AdminMapperProfile } from '@application/mappers/admin/admin.mapper';
import { TYPES } from '@di/types.di';
import { ISystemConfigRepository } from '@domain/repositories/ISystemConfigRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class GetSystemConfigKeysUsecase implements IGetSystemConfigKeysUsecase {
    constructor(
        @inject(TYPES.ISystemConfigRepository)
        private readonly _systemConfigRepository: ISystemConfigRepository,
    ) {}

    async execute(): Promise<Result<IGetSystemConfigKeysOutputDto>> {
        const configsResult = await this._systemConfigRepository.findAll({});

        if (configsResult.isFailure) {
            return Result.fail(configsResult.getError());
        }

        const result = [];
        for (const config of configsResult.getValue()) {
            result.push(AdminMapperProfile.toSystemConfigDto(config));
        }

        return Result.ok({
            configs: result,
        });
    }
}
