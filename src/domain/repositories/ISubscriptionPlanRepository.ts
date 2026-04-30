import { SubscriptionPlan } from '@domain/entities/subscription/subscription-plan.entity';
import { Result } from '@domain/shared/result';

export interface ISubscriptionPlanRepository {
    save(plan: SubscriptionPlan): Promise<Result<SubscriptionPlan>>;
    findAll(filters: {
        updatedAt?: Date;
        isActive?: boolean;
        isDefault?: boolean;
    }): Promise<Result<SubscriptionPlan[]>>;
    findById(id: string): Promise<Result<SubscriptionPlan | null>>;
    findActiveDefault(): Promise<Result<SubscriptionPlan | null>>;
    isSubscribedUsersExist(planId: string): Promise<Result<boolean>>;
}
