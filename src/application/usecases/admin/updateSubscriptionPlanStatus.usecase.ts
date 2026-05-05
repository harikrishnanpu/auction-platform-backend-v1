import { ISubscriptionPlanDto } from '@application/dtos/admin/subscription.dto';
import {
    IUpdateSubscriptionPlanStatusUsecase,
    IValidatedUpdateSubscriptionPlanStatusInput,
} from '@application/interfaces/usecases/admin/IUpdateSubscriptionPlanStatusUsecase';

import { AdminMapperProfile } from '@application/mappers/admin/admin.mapper';
import { TYPES } from '@di/types.di';
import { ISubscriptionPlanRepository } from '@domain/repositories/ISubscriptionPlanRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class UpdateSubscriptionPlanStatusUsecase implements IUpdateSubscriptionPlanStatusUsecase {
    constructor(
        @inject(TYPES.ISubscriptionPlanRepository)
        private readonly _subscriptionPlanRepository: ISubscriptionPlanRepository,
    ) {}

    async execute(
        input: IValidatedUpdateSubscriptionPlanStatusInput,
    ): Promise<Result<ISubscriptionPlanDto>> {
        const planEntityResult =
            await this._subscriptionPlanRepository.findById(input.planId);

        if (planEntityResult.isFailure)
            return Result.fail(planEntityResult.getError());
        const planEntity = planEntityResult.getValue();
        if (!planEntity) {
            return Result.fail('Subscription plan not found');
        }

        if (input.isDefault) {
            const defaultCheckResult =
                await this._subscriptionPlanRepository.findActiveDefault();
            if (defaultCheckResult.isFailure)
                return Result.fail(defaultCheckResult.getError());
            if (defaultCheckResult.getValue()) {
                return Result.fail('Already a plan is default');
            }
        }

        planEntity.updateStatus(input.isDefault, input.isActive);

        const updatedResult =
            await this._subscriptionPlanRepository.save(planEntity);

        if (updatedResult.isFailure) {
            return Result.fail(updatedResult.getError());
        }

        return Result.ok(
            AdminMapperProfile.toSubscriptionPlanDto(updatedResult.getValue()),
        );
    }
}
