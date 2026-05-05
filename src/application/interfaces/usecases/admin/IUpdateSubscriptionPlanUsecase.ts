import { ISubscriptionPlanDto } from '@application/dtos/admin/subscription.dto';
import { Result } from '@domain/shared/result';
import { ZodUpdateSubscriptionPlanInputType } from '@presentation/validators/schemas/admin/updateSubscriptionPlan.schema';

export interface IUpdateSubscriptionPlanUsecase {
    execute(
        input: ZodUpdateSubscriptionPlanInputType,
    ): Promise<Result<ISubscriptionPlanDto>>;
}
