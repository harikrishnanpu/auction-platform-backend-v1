import { PublicSubscriptionPlanDto } from '@application/dtos/user/publicSubscriptionPlan.dto';
import { Result } from '@domain/shared/result';

export interface IGetPublicSubscriptionPlansUsecase {
    execute(): Promise<Result<PublicSubscriptionPlanDto[]>>;
}
