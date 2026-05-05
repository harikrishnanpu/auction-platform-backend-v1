import { ISubscriptionPlanDto } from '@application/dtos/admin/subscription.dto';
import { Result } from '@domain/shared/result';
export interface IValidatedUpdateSubscriptionPlanStatusInput {
    planId: string;
    isDefault: boolean;
    isActive: boolean;
}

export interface IUpdateSubscriptionPlanStatusUsecase {
    execute(
        input: IValidatedUpdateSubscriptionPlanStatusInput,
    ): Promise<Result<ISubscriptionPlanDto>>;
}
