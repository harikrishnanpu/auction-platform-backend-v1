import { ISubscribedUserDto } from '@application/dtos/admin/subscription.dto';
import { UserSubscription } from '@domain/entities/subscription/user-subscription.entity';
import { Result } from '@domain/shared/result';

export interface IUserSubscriptionRepository {
    findAllWithUserAndPlan(): Promise<Result<ISubscribedUserDto[]>>;
    findAllPlansByUserId(userId: string): Promise<Result<UserSubscription[]>>;
    save(subscription: UserSubscription): Promise<Result<UserSubscription>>;
    findCurrentActiveByUserId(
        userId: string,
    ): Promise<Result<UserSubscription | null>>;
    findByRazorpaySubscriptionId(
        razorpaySubscriptionId: string,
    ): Promise<Result<UserSubscription | null>>;
    expireAllActiveForUser(userId: string): Promise<Result<void>>;
}
