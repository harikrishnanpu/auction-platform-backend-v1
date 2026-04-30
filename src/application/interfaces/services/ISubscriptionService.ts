import { Result } from '@domain/shared/result';

export interface ISubscriptionService {
    assignDefaultSubscriptionToUser(userId: string): Promise<Result<void>>;
}
