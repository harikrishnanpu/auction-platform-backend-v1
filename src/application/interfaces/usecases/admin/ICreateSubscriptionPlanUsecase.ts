import { ISubscriptionPlanDto } from '@application/dtos/admin/subscription.dto';
import { Result } from '@domain/shared/result';

export interface IValidatedCreateSubscriptionPlanInput {
    name: string;
    description: string;
    price: number;
    durationDays: number;
    isDefault: boolean;
    features: {
        featureId: string;
        value: string;
    }[];
}

export interface ICreateSubscriptionPlanUsecase {
    execute(
        input: IValidatedCreateSubscriptionPlanInput,
    ): Promise<Result<ISubscriptionPlanDto>>;
}
