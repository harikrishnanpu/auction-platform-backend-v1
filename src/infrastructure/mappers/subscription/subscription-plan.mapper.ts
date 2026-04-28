import {
    SubscriptionFeatureKey,
    SubscriptionFeatureValueType,
} from '@domain/constants/subscriptionFeature.constants';
import { SubscriptionPlan } from '@domain/entities/subscription/subscription-plan.entity';
import { SubscriptionPlanFeature } from '@domain/entities/subscription/subscription-plan-feature.entity';
import { IDbMapper } from '@domain/mappers/IDbMapper';
import { Result } from '@domain/shared/result';
import {
    SubscriptionPlan as PrismaSubscriptionPlanRow,
    SubscriptionPlanFeature as PrismaSubscriptionPlanFeatureRow,
    SubscriptionPlanFeatureEnum,
    SubscriptionPlanFeatureType,
} from '@prisma/client';
import { injectable } from 'inversify';

export type SubscriptionPlanPersistenceRow = PrismaSubscriptionPlanRow & {
    features: PrismaSubscriptionPlanFeatureRow[];
};

@injectable()
export class SubscriptionPlanMapper implements IDbMapper<
    SubscriptionPlan,
    SubscriptionPlanPersistenceRow
> {
    toDomain(raw: SubscriptionPlanPersistenceRow): Result<SubscriptionPlan> {
        const features: SubscriptionPlanFeature[] = [];
        for (const rawFeature of raw.features) {
            const mapped = SubscriptionPlanFeature.create({
                id: rawFeature.id,
                featureKey: rawFeature.feature as SubscriptionFeatureKey,
                description: rawFeature.description,
                value: rawFeature.value,
                type: rawFeature.type as SubscriptionFeatureValueType,
                createdAt: rawFeature.createdAt,
                updatedAt: rawFeature.updatedAt,
            });
            if (mapped.isFailure) return Result.fail(mapped.getError());
            features.push(mapped.getValue());
        }

        return SubscriptionPlan.create({
            id: raw.id,
            name: raw.name,
            description: raw.description,
            price: raw.price,
            durationDays: raw.durationDays,
            isDefault: raw.isDefault,
            isActive: raw.isActive,
            razorpayPlanId: raw.razorpayPlanId ?? null,
            features,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }

    toPersistence(entity: SubscriptionPlan): unknown {
        return {
            id: entity.getId(),
            name: entity.getName(),
            description: entity.getDescription(),
            price: entity.getPrice(),
            durationDays: entity.getDurationDays(),
            isDefault: entity.getIsDefault(),
            isActive: entity.getIsActive(),
            razorpayPlanId: entity.getRazorpayPlanId(),
            createdAt: entity.getCreatedAt(),
            updatedAt: entity.getUpdatedAt(),
            features: entity.getFeatures().map((feature) => ({
                id: feature.getId(),
                subscriptionPlanId: entity.getId(),
                feature: feature.getFeatureKey() as SubscriptionPlanFeatureEnum,
                description: feature.getDescription(),
                value: feature.getValue(),
                type: feature.getType() as SubscriptionPlanFeatureType,
                createdAt: feature.getCreatedAt(),
                updatedAt: feature.getUpdatedAt(),
            })),
        };
    }
}
