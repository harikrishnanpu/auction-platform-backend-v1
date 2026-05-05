import { ISubscriptionPlanDto } from '@application/dtos/admin/subscription.dto';
import { Result } from '@domain/shared/result';
import { ZodUpdateSubscriptionPlanStatusInputType } from '@presentation/validators/schemas/admin/updateSubscriptionPlanStatus.schema';

export interface IUpdateSubscriptionPlanStatusUsecase {
    execute(
        input: ZodUpdateSubscriptionPlanStatusInputType,
    ): Promise<Result<ISubscriptionPlanDto>>;
}
