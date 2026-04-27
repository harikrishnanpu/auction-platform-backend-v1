import { ISubscriptionPlanDto } from '@application/dtos/admin/subscription.dto';
import {
    SubscriptionFeatureKey,
    SubscriptionFeatureValueType,
} from '@domain/constants/subscriptionFeature.constants';
import { Result } from '@domain/shared/result';
import {
    SubscriptionPlan as PrismaSubscriptionPlan,
    SubscriptionPlanFeature as PrismaSubscriptionPlanFeature,
} from '@prisma/client';
import { injectable } from 'inversify';

@injectable()
export class SubscriptionPlanMapper {
    toDto(
        plan: PrismaSubscriptionPlan & {
            features: PrismaSubscriptionPlanFeature[];
        },
    ): Result<ISubscriptionPlanDto> {
        return Result.ok({
            id: plan.id,
            name: plan.name,
            description: plan.description,
            price: plan.price,
            durationDays: plan.durationDays,
            isActive: plan.isActive,
            createdAt: plan.createdAt,
            updatedAt: plan.updatedAt,
            features: plan.features.map((feature) => ({
                id: feature.id,
                featureKey: feature.feature as SubscriptionFeatureKey,
                value: feature.value,
                type: feature.type as SubscriptionFeatureValueType,
            })),
        });
    }
}
