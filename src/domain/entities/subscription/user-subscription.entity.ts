import { Result } from '@domain/shared/result';

export enum UserSubscriptionStatus {
    PENDING = 'PENDING',
    ACTIVE = 'ACTIVE',
    EXPIRED = 'EXPIRED',
    CANCELLED = 'CANCELLED',
    PAYMENT_FAILED = 'PAYMENT_FAILED',
}

export class UserSubscription {
    private constructor(
        private readonly id: string,
        private readonly userId: string,
        private readonly subscriptionPlanId: string,
        private readonly razorpaySubscriptionId: string | null,
        private status: UserSubscriptionStatus,
        private startDate: Date,
        private endDate: Date,
        private readonly createdAt: Date,
        private readonly updatedAt: Date,
    ) {}

    public static create({
        id,
        userId,
        subscriptionPlanId,
        razorpaySubscriptionId = null,
        status,
        startDate,
        endDate,
        createdAt,
        updatedAt,
    }: {
        id: string;
        userId: string;
        subscriptionPlanId: string;
        razorpaySubscriptionId?: string | null;
        status: UserSubscriptionStatus;
        startDate: Date;
        endDate: Date;
        createdAt: Date;
        updatedAt: Date;
    }): Result<UserSubscription> {
        return Result.ok(
            new UserSubscription(
                id,
                userId,
                subscriptionPlanId,
                razorpaySubscriptionId ?? null,
                status,
                startDate,
                endDate,
                createdAt,
                updatedAt,
            ),
        );
    }

    public setStatus(status: UserSubscriptionStatus): void {
        this.status = status;
    }

    public setStartDate(startDate: Date): void {
        this.startDate = startDate;
    }

    public setEndDate(endDate: Date): void {
        this.endDate = endDate;
    }

    public getId(): string {
        return this.id;
    }

    public getUserId(): string {
        return this.userId;
    }

    public getSubscriptionPlanId(): string {
        return this.subscriptionPlanId;
    }

    public getRazorpaySubscriptionId(): string | null {
        return this.razorpaySubscriptionId;
    }

    public getStatus(): UserSubscriptionStatus {
        return this.status;
    }

    public getStartDate(): Date {
        return this.startDate;
    }

    public getEndDate(): Date {
        return this.endDate;
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }

    public getUpdatedAt(): Date {
        return this.updatedAt;
    }
}
