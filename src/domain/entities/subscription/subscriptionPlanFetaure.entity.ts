import { Result } from '@domain/shared/result';
import { Features } from './features.entity';

export class SubscriptionPlanFeature {
    private constructor(
        private readonly id: string,
        private readonly subscriptionPlanId: string,
        private readonly featureId: string,
        private readonly value: string,
        private readonly feature: Features,
    ) {}

    public static create({
        id,
        subscriptionPlanId,
        featureId,
        value,
        feature,
    }: {
        id: string;
        subscriptionPlanId: string;
        featureId: string;
        value: string;
        feature: Features;
    }): Result<SubscriptionPlanFeature> {
        return Result.ok(
            new SubscriptionPlanFeature(
                id,
                subscriptionPlanId,
                featureId,
                value,
                feature,
            ),
        );
    }

    public getId(): string {
        return this.id;
    }

    public getSubscriptionPlanId(): string {
        return this.subscriptionPlanId;
    }

    public getFeatureId(): string {
        return this.featureId;
    }

    public getValue(): string {
        return this.value;
    }

    public getFeature(): Features {
        return this.feature;
    }
}
