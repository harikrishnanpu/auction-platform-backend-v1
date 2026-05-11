import {
    IGetSystemConfigsOutputDto,
    ISystemConfigDto,
} from '@application/dtos/admin/systemConfig.dto';
import { IGetSystemConfigsUsecase } from '@application/interfaces/usecases/admin/IGetSystemConfigsUsecase';
import { AdminMapperProfile } from '@application/mappers/admin/admin.mapper';
import { TYPES } from '@di/types.di';
import { ISystemConfigRepository } from '@domain/repositories/ISystemConfigRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class GetSystemConfigsUsecase implements IGetSystemConfigsUsecase {
    constructor(
        @inject(TYPES.ISystemConfigRepository)
        private readonly _systemConfigRepository: ISystemConfigRepository,
    ) {}

    async execute(): Promise<Result<IGetSystemConfigsOutputDto>> {
        const configsResult = await this._systemConfigRepository.findAll({});
        if (configsResult.isFailure)
            return Result.fail(configsResult.getError());

        const configs: ISystemConfigDto[] = [];

        for (const config of configsResult.getValue()) {
            configs.push(AdminMapperProfile.toSystemConfigDto(config));
        }

        return Result.ok({
            configs,
        });
    }
}
