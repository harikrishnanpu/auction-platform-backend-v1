import { IGetSubscriptionPlansOutputDto } from '@application/dtos/admin/subscription.dto';
import { Result } from '@domain/shared/result';

export interface IGetSubscriptionPlansUsecase {
    execute(): Promise<Result<IGetSubscriptionPlansOutputDto>>;
}
