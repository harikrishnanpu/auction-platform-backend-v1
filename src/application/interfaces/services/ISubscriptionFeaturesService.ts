import {
    ICreateSubscriptionPlanInputDto,
    ICreateSubscriptionPlanRequestDto,
} from '@application/dtos/admin/subscription.dto';
import { Result } from '@domain/shared/result';

export interface ISubscriptionFeaturesService {
    validateAndNormalizePlanInput(
        input: ICreateSubscriptionPlanRequestDto,
    ): Result<ICreateSubscriptionPlanInputDto>;
}
