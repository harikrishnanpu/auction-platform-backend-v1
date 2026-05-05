import { TYPES } from '@di/types.di';
import { SystemConfig } from '@domain/entities/system-config/system-config.entity';
import { IDbMapper } from '@domain/mappers/IDbMapper';
import { ISystemConfigRepository } from '@domain/repositories/ISystemConfigRepository';
import { Result } from '@domain/shared/result';
import {
    PrismaClient,
    SystemDbConfig as PrismaSystemDbConfig,
} from '@prisma/client';
import { inject, injectable } from 'inversify';
import { BaseRepository } from '../base/base.Repo';

@injectable()
export class PrismaSystemConfigRepository
    extends BaseRepository<
        SystemConfig,
        PrismaSystemDbConfig,
        { updatedAt?: Date },
        IDbMapper<SystemConfig, PrismaSystemDbConfig>
    >
    implements ISystemConfigRepository
{
    constructor(
        @inject(TYPES.PrismaClient)
        private readonly _prisma: PrismaClient,
        @inject(TYPES.SystemConfigMapper)
        private readonly _mapper: IDbMapper<SystemConfig, PrismaSystemDbConfig>,
    ) {
        super(_prisma.systemDbConfig, _mapper);
    }

    async findByKey(key: string): Promise<Result<SystemConfig | null>> {
        const row = await this._prisma.systemDbConfig.findUnique({
            where: { key },
        });

        if (!row) {
            return Result.ok(null);
        }

        const parsed = this._mapper.toDomain(row);
        if (parsed.isFailure) return Result.fail(parsed.getError());

        return Result.ok(parsed.getValue());
    }
}
