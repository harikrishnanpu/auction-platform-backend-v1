import {
    SystemConfig,
    SystemConfigKey,
    SystemConfigValueType,
} from '@domain/entities/system-config/system-config.entity';
import { IDbMapper } from '@domain/mappers/IDbMapper';
import { Result } from '@domain/shared/result';
import { SystemDbConfig as PrismaSystemDbConfig } from '@prisma/client';
import { injectable } from 'inversify';

@injectable()
export class SystemConfigMapper implements IDbMapper<
    SystemConfig,
    PrismaSystemDbConfig
> {
    toDomain(raw: PrismaSystemDbConfig): Result<SystemConfig> {
        return SystemConfig.create({
            id: raw.id,
            key: raw.key as SystemConfigKey,
            value: raw.value,
            valueType: raw.type as SystemConfigValueType,
            description: raw.description,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }

    toPersistence(entity: SystemConfig): unknown {
        return {
            id: entity.getId(),
            key: entity.getKey(),
            value: entity.getValue(),
            type: entity.getValueType(),
            description: entity.getDescription(),
            createdAt: entity.getCreatedAt(),
            updatedAt: entity.getUpdatedAt(),
        };
    }
}
