import {
    SubscriptionFeatureKey,
    SubscriptionFeatureValueType,
    Features,
} from '@domain/entities/subscription/features.entity';
import { IDbMapper } from '@domain/mappers/IDbMapper';
import { Result } from '@domain/shared/result';
import { Features as PrismaFeatures } from '@prisma/client';

export class SubscriptionFeaturesMapper implements IDbMapper<
    Features,
    PrismaFeatures
> {
    toDomain(raw: PrismaFeatures): Result<Features> {
        return Features.create({
            id: raw.id,
            featureKey: raw.feature as SubscriptionFeatureKey,
            description: raw.description,
            type: raw.type as SubscriptionFeatureValueType,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }

    toPersistence(entity: Features): unknown {
        return {
            id: entity.getId(),
            featureKey: entity.getFeatureKey(),
            description: entity.getDescription(),
            type: entity.getType(),
        };
    }
}
