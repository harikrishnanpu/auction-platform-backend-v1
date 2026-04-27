import { IGetSystemConfigsOutputDto } from '@application/dtos/admin/systemConfig.dto';
import { IGetSystemConfigsUsecase } from '@application/interfaces/usecases/admin/IGetSystemConfigsUsecase';
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
        const configsResult = await this._systemConfigRepository.findAll();
        if (configsResult.isFailure)
            return Result.fail(configsResult.getError());

        return Result.ok({
            configs: configsResult.getValue().map((config) => ({
                id: config.getId(),
                key: config.getKey(),
                value: config.getValue(),
                description: config.getDescription(),
                createdAt: config.getCreatedAt(),
                updatedAt: config.getUpdatedAt(),
            })),
        });
    }
}
