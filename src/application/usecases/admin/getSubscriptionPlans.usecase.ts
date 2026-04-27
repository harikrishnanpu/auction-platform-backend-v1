import { IGetSubscriptionPlansOutputDto } from '@application/dtos/admin/subscription.dto';
import { IGetSubscriptionPlansUsecase } from '@application/interfaces/usecases/admin/IGetSubscriptionPlansUsecase';
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
        const plansResult = await this._subscriptionPlanRepository.findAll();
        if (plansResult.isFailure) return Result.fail(plansResult.getError());

        return Result.ok({ plans: plansResult.getValue() });
    }
}
