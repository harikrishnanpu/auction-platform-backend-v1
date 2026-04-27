import { SystemConfig } from '@domain/entities/system-config/system-config.entity';
import { Result } from '@domain/shared/result';

export interface ISystemConfigRepository {
    findAll(filters: { key?: string }): Promise<Result<SystemConfig[] | []>>;
    findByKey(key: string): Promise<Result<SystemConfig | null>>;
    save(input: SystemConfig): Promise<Result<SystemConfig>>;
}
