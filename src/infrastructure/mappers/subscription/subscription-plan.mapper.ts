import { SubscriptionPlanFeature } from '@domain/entities/subscription/subscriptionPlanFetaure.entity';
import { SubscriptionPlan } from '@domain/entities/subscription/subscription-plan.entity';
import { Features } from '@domain/entities/subscription/features.entity';
import { IDbMapper } from '@domain/mappers/IDbMapper';
import { Result } from '@domain/shared/result';
import {
    SubscriptionPlanFeatureEnum,
    SubscriptionPlanFeatureType,
    SubscriptionPlan as PrismaSubscriptionPlan,
    SubscriptionPlanFeature as PrismaSubscriptionPlanFeature,
} from '@prisma/client';

export type PrismaSubscriptionPlanWithFeatures = PrismaSubscriptionPlan & {
    features: PrismaSubscriptionPlanFeature[];
};

export class SubscriptionPlanMapper implements IDbMapper<
    SubscriptionPlan,
    PrismaSubscriptionPlanWithFeatures
> {
    toDomain(
        raw: PrismaSubscriptionPlanWithFeatures,
    ): Result<SubscriptionPlan> {
        const features: Features[] = [];

        for (const rawFeature of raw.features) {
            const mapped = SubscriptionPlanFeature.create({
                id: rawFeature.id,
                subscriptionPlanId: raw.id,
                featureId: rawFeature.featureId,
                value: rawFeature.value,
                feature: Features.create({
                    id: rawFeature.featureId,
                    featureKey: rawFeature.featureId,
                    description: rawFeature.description,
                    type: rawFeature.type as SubscriptionFeatureValueType,
                    createdAt: rawFeature.createdAt,
                    updatedAt: rawFeature.updatedAt,
                }).getValue(),
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
            features: featuresEntities,
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
            })),
        };
    }
}
