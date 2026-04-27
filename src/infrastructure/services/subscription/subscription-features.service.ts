import {
    ICreateSubscriptionPlanFeatureInputDto,
    ICreateSubscriptionPlanInputDto,
} from '@application/dtos/admin/subscription.dto';
import { ISubscriptionFeaturesService } from '@application/interfaces/services/ISubscriptionFeaturesService';
import {
    SubscriptionFeatureValueType,
    SubscriptionFeatureKey,
} from '@domain/constants/subscriptionFeature.constants';
import { Result } from '@domain/shared/result';
import { injectable } from 'inversify';

@injectable()
export class SubscriptionFeaturesService implements ISubscriptionFeaturesService {
    validateAndNormalizePlanInput(
        input: ICreateSubscriptionPlanInputDto,
    ): Result<ICreateSubscriptionPlanInputDto> {
        const featureSet = new Set<SubscriptionFeatureKey>();

        for (const feature of input.features) {
            if (featureSet.has(feature.featureKey)) {
                return Result.fail(
                    `Duplicate feature key: ${feature.featureKey}`,
                );
            }
            featureSet.add(feature.featureKey);

            const featureCheck = this.validateFeatureValue(feature);
            if (featureCheck.isFailure)
                return Result.fail(featureCheck.getError());
        }

        return Result.ok(input);
    }

    validateFeatureValue(
        feature: ICreateSubscriptionPlanFeatureInputDto,
    ): Result<null> {
        if (feature.type === SubscriptionFeatureValueType.BOOLEAN) {
            if (!['true', 'false'].includes(feature.value.toLowerCase())) {
                return Result.fail(
                    `${feature.featureKey} must be true or false`,
                );
            }
        }

        if (feature.type === SubscriptionFeatureValueType.NUMBER) {
            if (Number.isNaN(Number(feature.value))) {
                return Result.fail(
                    `${feature.featureKey} must be a valid number`,
                );
            }
        }

        return Result.ok(null);
    }
}
