import { ISubscriptionPlanDto } from '@application/dtos/admin/subscription.dto';
import { Result } from '@domain/shared/result';

export interface ISubscriptionPlanRepository {
    create(input: {
        name: string;
        description: string;
        price: number;
        durationDays: number;
        features: {
            featureKey: string;
            value: string;
            type: string;
        }[];
    }): Promise<Result<ISubscriptionPlanDto>>;
    findAll(): Promise<Result<ISubscriptionPlanDto[]>>;
}
