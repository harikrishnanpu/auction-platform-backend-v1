import { SubscriptionPlanFeature } from '@domain/entities/subscription/subscriptionPlanFetaure.entity';
import { SubscriptionPlan } from '@domain/entities/subscription/subscription-plan.entity';
import {
    Features,
    SubscriptionFeatureKey,
    SubscriptionFeatureValueType,
} from '@domain/entities/subscription/features.entity';
import { IDbMapper } from '@domain/mappers/IDbMapper';
import { Result } from '@domain/shared/result';
import {
    SubscriptionPlan as PrismaSubscriptionPlan,
    SubscriptionPlanFeature as PrismaSubscriptionPlanFeature,
    Features as PrismaFeatures,
} from '@prisma/client';

export type PrismaSubscriptionPlanFeatureWithFeature =
    PrismaSubscriptionPlanFeature & {
        feature: PrismaFeatures;
    };

export type PrismaSubscriptionPlanWithFeatures = PrismaSubscriptionPlan & {
    features: PrismaSubscriptionPlanFeatureWithFeature[];
};

export class SubscriptionPlanMapper implements IDbMapper<
    SubscriptionPlan,
    PrismaSubscriptionPlanWithFeatures
> {
    toDomain(
        raw: PrismaSubscriptionPlanWithFeatures,
    ): Result<SubscriptionPlan> {
        const mappedFeatures: SubscriptionPlanFeature[] = [];

        for (const rawFeature of raw.features) {
            const feature = Features.create({
                id: rawFeature.feature.id,
                featureKey: rawFeature.feature
                    .feature as SubscriptionFeatureKey,
                description: rawFeature.feature.description,
                type: rawFeature.feature.type as SubscriptionFeatureValueType,
                createdAt: rawFeature.feature.createdAt,
                updatedAt: rawFeature.feature.updatedAt,
            });

            if (feature.isFailure) return Result.fail(feature.getError());

            const mapped = SubscriptionPlanFeature.create({
                id: rawFeature.id,
                subscriptionPlanId: rawFeature.subscriptionPlanId,
                featureId: rawFeature.featureId,
                value: rawFeature.value,
                feature: feature.getValue(),
            });

            if (mapped.isFailure) return Result.fail(mapped.getError());
            mappedFeatures.push(mapped.getValue());
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
            features: mappedFeatures,
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
            features: entity.getFeatures().map((planFeature) => ({
                id: planFeature.getId(),
                subscriptionPlanId: planFeature.getSubscriptionPlanId(),
                featureId: planFeature.getFeatureId(),
                value: planFeature.getValue(),
                createdAt: entity.getCreatedAt(),
                updatedAt: entity.getUpdatedAt(),
                feature: {
                    id: planFeature.getFeature().getId(),
                    feature: planFeature.getFeature().getFeatureKey(),
                    description: planFeature.getFeature().getDescription(),
                    type: planFeature.getFeature().getType(),
                    createdAt: planFeature.getFeature().getCreatedAt(),
                    updatedAt: planFeature.getFeature().getUpdatedAt(),
                },
            })),
        };
    }
}
