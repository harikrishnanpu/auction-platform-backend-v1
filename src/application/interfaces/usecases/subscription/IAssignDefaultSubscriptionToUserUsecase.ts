import { Result } from '@domain/shared/result';

export interface IAssignDefaultSubscriptionToUserUsecase {
    execute(userId: string): Promise<Result<void>>;
}
