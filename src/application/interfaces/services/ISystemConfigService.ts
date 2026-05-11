import { Result } from '@domain/shared/result';
import { SystemConfigKey } from '@domain/entities/system-config/system-config.entity';
import { ISystemConfigDto } from '@application/dtos/admin/systemConfig.dto';

export interface ISystemConfigService {
    getConfigByKey(key: SystemConfigKey): Promise<Result<ISystemConfigDto>>;
}
