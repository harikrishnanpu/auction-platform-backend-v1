import { UserSubscription } from '@domain/entities/subscription/user-subscription.entity';
import { Result } from '@domain/shared/result';

export interface ISubscriptionService {
    assignDefaultSubscriptionToUser(
        userId: string,
    ): Promise<Result<UserSubscription>>;
}
