import { ISubscriptionPlanDto } from '@application/dtos/admin/subscription.dto';
import { Result } from '@domain/shared/result';
export interface IValidatedUpdateSubscriptionPlanInput {
    planId: string;
    name: string;
    description: string;
    price: number;
    durationDays: number;
    isDefault: boolean;
    isActive: boolean;
    features: {
        featureId: string;
        value: string;
    }[];
}

export interface IUpdateSubscriptionPlanUsecase {
    execute(
        input: IValidatedUpdateSubscriptionPlanInput,
    ): Promise<Result<ISubscriptionPlanDto>>;
}
