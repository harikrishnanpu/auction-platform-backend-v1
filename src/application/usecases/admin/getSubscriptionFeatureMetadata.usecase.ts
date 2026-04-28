import {
    IGetSubscriptionFeatureMetadataOutputDto,
    IAllowedSubscriptionFeatureMetadataDto,
} from '@application/dtos/admin/subscription.dto';
import { IGetSubscriptionFeatureMetadataUsecase } from '@application/interfaces/usecases/admin/IGetSubscriptionFeatureMetadataUsecase';
import { ALLOWED_SUBSCRIPTION_FEATURES } from '@domain/constants/subscriptionFeature.constants';
import { Result } from '@domain/shared/result';
import { injectable } from 'inversify';

@injectable()
export class GetSubscriptionFeatureMetadataUsecase implements IGetSubscriptionFeatureMetadataUsecase {
    async execute(): Promise<Result<IGetSubscriptionFeatureMetadataOutputDto>> {
        const features: IAllowedSubscriptionFeatureMetadataDto[] =
            ALLOWED_SUBSCRIPTION_FEATURES.map((f) => ({
                key: f.key,
                valueType: f.valueType,
                description: f.description,
            }));
        return Result.ok({ features });
    }
}
