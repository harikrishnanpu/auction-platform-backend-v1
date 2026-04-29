import { Result } from '@domain/shared/result';
import { SubscriptionPlanFeature } from './subscriptionPlanFetaure.entity';

export class SubscriptionPlan {
    private constructor(
        private readonly id: string,
        private readonly name: string,
        private readonly description: string,
        private readonly price: number,
        private readonly durationDays: number,
        private readonly isDefault: boolean,
        private readonly isActive: boolean,
        private readonly razorpayPlanId: string | null,
        private readonly features: SubscriptionPlanFeature[],
        private readonly createdAt: Date,
        private readonly updatedAt: Date,
    ) {}

    public static create({
        id,
        name,
        description,
        price,
        durationDays,
        isDefault,
        isActive,
        razorpayPlanId = null,
        features,
        createdAt,
        updatedAt,
    }: {
        id: string;
        name: string;
        description: string;
        price: number;
        durationDays: number;
        isDefault: boolean;
        isActive: boolean;
        razorpayPlanId?: string | null;
        features: SubscriptionPlanFeature[];
        createdAt: Date;
        updatedAt: Date;
    }): Result<SubscriptionPlan> {
        return Result.ok(
            new SubscriptionPlan(
                id,
                name,
                description,
                price,
                durationDays,
                isDefault,
                isActive,
                razorpayPlanId ?? null,
                features,
                createdAt,
                updatedAt,
            ),
        );
    }

    public getId(): string {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    public getDescription(): string {
        return this.description;
    }

    public getPrice(): number {
        return this.price;
    }

    public getDurationDays(): number {
        return this.durationDays;
    }

    public getIsDefault(): boolean {
        return this.isDefault;
    }

    public getIsActive(): boolean {
        return this.isActive;
    }

    public getRazorpayPlanId(): string | null {
        return this.razorpayPlanId;
    }

    public getFeatures(): SubscriptionPlanFeature[] {
        return this.features;
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }

    public getUpdatedAt(): Date {
        return this.updatedAt;
    }
}
