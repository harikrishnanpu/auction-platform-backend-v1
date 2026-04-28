import { SubscriptionPlan } from '@domain/entities/subscription/subscription-plan.entity';
import { Result } from '@domain/shared/result';

export interface ISubscriptionPlanRepository {
    save(plan: SubscriptionPlan): Promise<Result<SubscriptionPlan>>;
    findAll(): Promise<Result<SubscriptionPlan[]>>;
    findActiveDefault(): Promise<Result<SubscriptionPlan | null>>;
    hasDefaultPlan(): Promise<Result<boolean>>;
    findById(id: string): Promise<Result<SubscriptionPlan | null>>;
    hasAnotherDefaultPlan(excludePlanId: string): Promise<Result<boolean>>;
    updateStatus(
        id: string,
        input: {
            isDefault: boolean;
            isActive: boolean;
        },
    ): Promise<Result<SubscriptionPlan>>;
}
