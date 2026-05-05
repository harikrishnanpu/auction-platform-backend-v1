import { ISubscriptionPlanDto } from '@application/dtos/admin/subscription.dto';
import { Result } from '@domain/shared/result';
import { ZodCreateSubscriptionPlanInputType } from '@presentation/validators/schemas/admin/createSubscriptionPlan.schema';

export interface ICreateSubscriptionPlanUsecase {
    execute(
        input: ZodCreateSubscriptionPlanInputType,
    ): Promise<Result<ISubscriptionPlanDto>>;
}
