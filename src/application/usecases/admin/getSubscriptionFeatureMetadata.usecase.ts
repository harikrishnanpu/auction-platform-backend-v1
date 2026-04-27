import { IGetSubscriptionFeatureMetadataOutputDto } from '@application/dtos/admin/subscription.dto';
import { IGetSubscriptionFeatureMetadataUsecase } from '@application/interfaces/usecases/admin/IGetSubscriptionFeatureMetadataUsecase';
import {
    SubscriptionFeatureKey,
    SubscriptionFeatureValueType,
} from '@domain/constants/subscriptionFeature.constants';
import { Result } from '@domain/shared/result';
import { injectable } from 'inversify';

@injectable()
export class GetSubscriptionFeatureMetadataUsecase implements IGetSubscriptionFeatureMetadataUsecase {
    async execute(): Promise<Result<IGetSubscriptionFeatureMetadataOutputDto>> {
        return Result.ok({
            featureKeys: Object.values(SubscriptionFeatureKey),
            valueTypes: Object.values(SubscriptionFeatureValueType),
        });
    }
}
