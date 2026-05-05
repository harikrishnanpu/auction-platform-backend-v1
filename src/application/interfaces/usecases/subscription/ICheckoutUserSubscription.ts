import { StartSubscriptionCheckoutOutputDto } from '@application/dtos/user/startSubscriptionCheckout.dto';
import { Result } from '@domain/shared/result';

export interface ICheckoutUserSubscriptionUsecase {
    execute({
        userId,
        subscriptionPlanId,
    }: {
        userId: string;
        subscriptionPlanId: string;
    }): Promise<Result<StartSubscriptionCheckoutOutputDto>>;
}
