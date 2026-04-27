import {
    ICreateSubscriptionPlanFeatureInputDto,
    ICreateSubscriptionPlanInputDto,
} from '@application/dtos/admin/subscription.dto';
import { Result } from '@domain/shared/result';

export interface ISubscriptionFeaturesService {
    validateAndNormalizePlanInput(
        input: ICreateSubscriptionPlanInputDto,
    ): Result<ICreateSubscriptionPlanInputDto>;
    validateFeatureValue(
        feature: ICreateSubscriptionPlanFeatureInputDto,
    ): Result<null>;
}
