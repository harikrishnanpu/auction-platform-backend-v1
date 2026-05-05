import { ISubscriptionFeaturesRepository } from '@domain/repositories/ISubscriptionFetauresRepository';
import { BaseRepository } from '../base/base.Repo';
import { PrismaClient, Features as PrismaFeatures } from '@prisma/client';
import { TYPES } from '@di/types.di';
import { inject } from 'inversify';
import { IDbMapper } from '@domain/mappers/IDbMapper';
import { Features } from '@domain/entities/subscription/features.entity';
import { Result } from '@domain/shared/result';

export class PrismaSubscriptionFeaturesRepository
    extends BaseRepository<
        Features,
        PrismaFeatures,
        { updatedAt?: Date },
        IDbMapper<Features, PrismaFeatures>
    >
    implements ISubscriptionFeaturesRepository
{
    constructor(
        @inject(TYPES.PrismaClient)
        private readonly _prisma: PrismaClient,
        @inject(TYPES.SubscriptionFeaturesMapper)
        private readonly _mapper: IDbMapper<Features, PrismaFeatures>,
    ) {
        super(_prisma.features, _mapper);
    }

    async findByIds(ids: string[]): Promise<Result<Features[]>> {
        const dbFeatures = await this._prisma.features.findMany({
            where: { id: { in: ids } },
        });

        if (dbFeatures.length !== ids.length) {
            return Result.fail('Some features not found');
        }

        const resluts: Features[] = [];

        for (const feat of dbFeatures) {
            const result = this._mapper.toDomain(feat);
            if (result.isFailure) return Result.fail(result.getError());
            resluts.push(result.getValue());
        }

        return Result.ok(resluts);
    }
}
