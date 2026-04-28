import {
    SubscriptionFeatureKey,
    SubscriptionFeatureValueType,
} from '@domain/constants/subscriptionFeature.constants';
import { Result } from '@domain/shared/result';

export class SubscriptionPlanFeature {
    private constructor(
        private readonly id: string,
        private readonly featureKey: SubscriptionFeatureKey,
        private readonly description: string,
        private readonly value: string,
        private readonly type: SubscriptionFeatureValueType,
        private readonly createdAt: Date,
        private readonly updatedAt: Date,
    ) {}

    public static create({
        id,
        featureKey,
        description,
        value,
        type,
        createdAt,
        updatedAt,
    }: {
        id: string;
        featureKey: SubscriptionFeatureKey;
        description: string;
        value: string;
        type: SubscriptionFeatureValueType;
        createdAt: Date;
        updatedAt: Date;
    }): Result<SubscriptionPlanFeature> {
        return Result.ok(
            new SubscriptionPlanFeature(
                id,
                featureKey,
                description,
                value,
                type,
                createdAt,
                updatedAt,
            ),
        );
    }

    public getId(): string {
        return this.id;
    }

    public getFeatureKey(): SubscriptionFeatureKey {
        return this.featureKey;
    }

    public getDescription(): string {
        return this.description;
    }

    public getValue(): string {
        return this.value;
    }

    public getType(): SubscriptionFeatureValueType {
        return this.type;
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }

    public getUpdatedAt(): Date {
        return this.updatedAt;
    }
}
