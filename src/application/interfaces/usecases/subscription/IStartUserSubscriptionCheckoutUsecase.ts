import { StartSubscriptionCheckoutOutputDto } from '@application/dtos/user/startSubscriptionCheckout.dto';
import { Result } from '@domain/shared/result';

export interface IStartUserSubscriptionCheckoutUsecase {
    execute(
        userId: string,
        subscriptionPlanId: string,
    ): Promise<Result<StartSubscriptionCheckoutOutputDto>>;
}
