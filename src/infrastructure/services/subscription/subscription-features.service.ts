import {
    ICreateSubscriptionPlanFeatureInputDto,
    ICreateSubscriptionPlanInputDto,
    ICreateSubscriptionPlanRequestDto,
} from '@application/dtos/admin/subscription.dto';
import { ISubscriptionFeaturesService } from '@application/interfaces/services/ISubscriptionFeaturesService';
import {
    getAllowedSubscriptionFeature,
    SubscriptionFeatureValueType,
} from '@domain/constants/subscriptionFeature.constants';
import { Result } from '@domain/shared/result';
import { injectable } from 'inversify';

@injectable()
export class SubscriptionFeaturesService implements ISubscriptionFeaturesService {
    validateAndNormalizePlanInput(
        input: ICreateSubscriptionPlanRequestDto,
    ): Result<ICreateSubscriptionPlanInputDto> {
        const used = new Set<string>();
        const normalized: ICreateSubscriptionPlanFeatureInputDto[] = [];

        for (const item of input.features) {
            if (used.has(item.featureKey)) {
                return Result.fail(`Duplicate feature: ${item.featureKey}`);
            }
            used.add(item.featureKey);

            const def = getAllowedSubscriptionFeature(item.featureKey);
            if (!def) {
                return Result.fail(
                    `Unknown or disallowed feature: ${item.featureKey}`,
                );
            }

            const value = item.value.trim();
            const valueResult = this.assertValueMatchesType(
                def.valueType,
                value,
                item.featureKey,
            );
            if (valueResult.isFailure) {
                return Result.fail(valueResult.getError());
            }

            normalized.push({
                featureKey: item.featureKey,
                description: def.description,
                value,
                type: def.valueType,
            });
        }

        return Result.ok({
            name: input.name,
            description: input.description,
            price: input.price,
            durationDays: input.durationDays,
            isDefault: input.isDefault,
            features: normalized,
        });
    }

    private assertValueMatchesType(
        valueType: SubscriptionFeatureValueType,
        value: string,
        featureKey: string,
    ): Result<null> {
        if (value.length === 0) {
            return Result.fail(`${featureKey}: value is required`);
        }

        if (valueType === SubscriptionFeatureValueType.BOOLEAN) {
            const v = value.toLowerCase();
            if (v !== 'true' && v !== 'false') {
                return Result.fail(
                    `${featureKey}: value must be "true" or "false" for this feature`,
                );
            }
        }

        if (valueType === SubscriptionFeatureValueType.NUMBER) {
            if (Number.isNaN(Number(value))) {
                return Result.fail(
                    `${featureKey}: value must be a valid number for this feature`,
                );
            }
        }

        return Result.ok(null);
    }
}
