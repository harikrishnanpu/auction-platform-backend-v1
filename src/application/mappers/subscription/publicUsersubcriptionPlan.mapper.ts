import { IPublicSubscriptionPlaDto } from '@application/dtos/user/publicSubscriptionPlan.dto';
import { SubscriptionPlan } from '@domain/entities/subscription/subscription-plan.entity';

export class PublicUsersubcriptionPlanMapper {
    public static toPublicSubscriptionPlanDto(
        plan: SubscriptionPlan,
        isCurrentPlan: boolean,
        rank: number,
    ): IPublicSubscriptionPlaDto {
        return {
            id: plan.getId(),
            name: plan.getName(),
            description: plan.getDescription(),
            price: plan.getPrice(),
            durationDays: plan.getDurationDays(),
            isDefault: plan.getIsDefault(),
            rank,
            features: plan.getFeatures().map((f) => ({
                id: f.getId(),
                featureKey: f.getFeature().getFeatureKey(),
                description: f.getFeature().getDescription(),
                value: f.getValue(),
                type: f.getFeature().getType(),
            })),
            isCurrentPlan: isCurrentPlan,
        };
    }
}
