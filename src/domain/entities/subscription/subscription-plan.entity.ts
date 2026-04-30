import { Result } from '@domain/shared/result';
import { SubscriptionPlanFeature } from './subscriptionPlanFetaure.entity';

export class SubscriptionPlan {
    private constructor(
        private readonly id: string,
        private name: string,
        private description: string,
        private price: number,
        private durationDays: number,
        private isDefault: boolean,
        private isActive: boolean,
        private razorpayPlanId: string | null,
        private features: SubscriptionPlanFeature[],
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

    public updateStatus(isDefault: boolean, isActive: boolean): Result<void> {
        this.isDefault = isDefault;
        this.isActive = isActive;
        return Result.ok();
    }

    public update(
        name: string,
        description: string,
        durationDays: number,
    ): Result<void> {
        this.name = name;
        this.description = description;
        this.durationDays = durationDays;
        return Result.ok();
    }

    public updateFeatures(features: SubscriptionPlanFeature[]): Result<void> {
        this.features = features;
        return Result.ok();
    }

    public updatePrice(price: number): Result<void> {
        this.price = price;
        return Result.ok();
    }

    public updateRazorpayPlanId(razorpayPlanId: string): Result<void> {
        this.razorpayPlanId = razorpayPlanId;
        return Result.ok();
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
