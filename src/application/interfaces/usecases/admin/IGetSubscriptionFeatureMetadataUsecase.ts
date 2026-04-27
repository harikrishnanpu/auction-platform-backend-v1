import { IGetSubscriptionFeatureMetadataOutputDto } from '@application/dtos/admin/subscription.dto';
import { Result } from '@domain/shared/result';

export interface IGetSubscriptionFeatureMetadataUsecase {
    execute(): Promise<Result<IGetSubscriptionFeatureMetadataOutputDto>>;
}
