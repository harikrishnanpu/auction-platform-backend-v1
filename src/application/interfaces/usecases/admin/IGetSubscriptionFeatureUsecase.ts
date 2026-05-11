import { IGetSubscriptionFeaturesOutputDto } from '@application/dtos/admin/subscription.dto';
import { Result } from '@domain/shared/result';

export interface IGetSubscriptionFeaturesUsecase {
    execute(): Promise<Result<IGetSubscriptionFeaturesOutputDto>>;
}
