import { ISystemConfigDto } from '@application/dtos/admin/systemConfig.dto';
import { SystemConfigKey } from '@domain/entities/system-config/system-config.entity';
import { Result } from '@domain/shared/result';

export interface IValidatedEditSystemConfigInput {
    key: SystemConfigKey;
    description: string;
    value: string;
}

export interface IEditSystemConfigUsecase {
    execute(
        input: IValidatedEditSystemConfigInput,
    ): Promise<Result<ISystemConfigDto>>;
}
