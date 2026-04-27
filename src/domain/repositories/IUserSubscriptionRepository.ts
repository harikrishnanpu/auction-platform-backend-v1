import { ISubscribedUserDto } from '@application/dtos/admin/subscription.dto';
import { Result } from '@domain/shared/result';

export interface IUserSubscriptionRepository {
    findAllWithUserAndPlan(): Promise<Result<ISubscribedUserDto[]>>;
}
