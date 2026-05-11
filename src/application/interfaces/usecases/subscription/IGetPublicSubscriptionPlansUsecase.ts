import { IPublicSubscriptionPlaDto } from '@application/dtos/user/publicSubscriptionPlan.dto';
import { Result } from '@domain/shared/result';

export interface IGetPublicSubscriptionPlansUsecase {
    execute(userId: string): Promise<Result<IPublicSubscriptionPlaDto[]>>;
}
