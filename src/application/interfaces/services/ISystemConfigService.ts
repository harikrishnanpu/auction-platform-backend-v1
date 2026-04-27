import { Result } from '@domain/shared/result';
import { SystemConfigKey } from '../../../domain/constants/systemConfig.constants';

export interface ISystemConfigService {
    getString(
        key: SystemConfigKey,
        fallbackValue?: string,
    ): Promise<Result<string>>;
    getNumber(
        key: SystemConfigKey,
        fallbackValue?: number,
    ): Promise<Result<number>>;
}
