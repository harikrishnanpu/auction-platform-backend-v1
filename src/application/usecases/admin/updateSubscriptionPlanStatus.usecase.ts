import { ISubscriptionPlanDto } from '@application/dtos/admin/subscription.dto';
import { IUpdateSubscriptionPlanStatusUsecase } from '@application/interfaces/usecases/admin/IUpdateSubscriptionPlanStatusUsecase';
import { AdminMapperProfile } from '@application/mappers/admin/admin.mapper';
import { TYPES } from '@di/types.di';
import { ISubscriptionPlanRepository } from '@domain/repositories/ISubscriptionPlanRepository';
import { Result } from '@domain/shared/result';
import { ZodUpdateSubscriptionPlanStatusInputType } from '@presentation/validators/schemas/admin/updateSubscriptionPlanStatus.schema';
import { inject, injectable } from 'inversify';

@injectable()
export class UpdateSubscriptionPlanStatusUsecase implements IUpdateSubscriptionPlanStatusUsecase {
    constructor(
        @inject(TYPES.ISubscriptionPlanRepository)
        private readonly _subscriptionPlanRepository: ISubscriptionPlanRepository,
    ) {}

    async execute(
        input: ZodUpdateSubscriptionPlanStatusInputType,
    ): Promise<Result<ISubscriptionPlanDto>> {
        const planResult = await this._subscriptionPlanRepository.findById(
            input.planId,
        );
        if (planResult.isFailure) return Result.fail(planResult.getError());
        if (!planResult.getValue())
            return Result.fail('Subscription plan not found');

        if (input.isDefault) {
            const defaultCheckResult =
                await this._subscriptionPlanRepository.hasAnotherDefaultPlan(
                    input.planId,
                );
            if (defaultCheckResult.isFailure)
                return Result.fail(defaultCheckResult.getError());
            if (defaultCheckResult.getValue()) {
                return Result.fail('Already a plan is default');
            }
        }

        const updatedResult =
            await this._subscriptionPlanRepository.updateStatus(input.planId, {
                isDefault: input.isDefault,
                isActive: input.isActive,
            });
        if (updatedResult.isFailure)
            return Result.fail(updatedResult.getError());

        return Result.ok(
            AdminMapperProfile.toSubscriptionPlanDto(updatedResult.getValue()),
        );
    }
}
