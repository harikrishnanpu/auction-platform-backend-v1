import {
    IGetSubscriptionPlansOutputDto,
    ISubscriptionPlanDto,
} from '@application/dtos/admin/subscription.dto';
import { IGetSubscriptionPlansUsecase } from '@application/interfaces/usecases/admin/IGetSubscriptionPlansUsecase';
import { AdminMapperProfile } from '@application/mappers/admin/admin.mapper';
import { TYPES } from '@di/types.di';
import { ISubscriptionPlanRepository } from '@domain/repositories/ISubscriptionPlanRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class GetSubscriptionPlansUsecase implements IGetSubscriptionPlansUsecase {
    constructor(
        @inject(TYPES.ISubscriptionPlanRepository)
        private readonly _subscriptionPlanRepository: ISubscriptionPlanRepository,
    ) {}

    async execute(): Promise<Result<IGetSubscriptionPlansOutputDto>> {
        const plansResult = await this._subscriptionPlanRepository.findAll({});
        if (plansResult.isFailure) return Result.fail(plansResult.getError());

        const plans: ISubscriptionPlanDto[] = [];

        for (const plan of plansResult.getValue()) {
            plans.push(AdminMapperProfile.toSubscriptionPlanDto(plan));
        }

        return Result.ok({
            plans,
        });
    }
}
