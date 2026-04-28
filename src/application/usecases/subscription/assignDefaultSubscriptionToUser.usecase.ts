import { USER_SUBSCRIPTION_INFINITE_END } from '@application/constants/subscription.constants';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { IAssignDefaultSubscriptionToUserUsecase } from '@application/interfaces/usecases/subscription/IAssignDefaultSubscriptionToUserUsecase';
import { TYPES } from '@di/types.di';
import { UserSubscriptionStatus } from '@domain/entities/subscription/user-subscription.entity';
import { UserSubscription } from '@domain/entities/subscription/user-subscription.entity';
import { ISubscriptionPlanRepository } from '@domain/repositories/ISubscriptionPlanRepository';
import { IUserSubscriptionRepository } from '@domain/repositories/IUserSubscriptionRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class AssignDefaultSubscriptionToUserUsecase implements IAssignDefaultSubscriptionToUserUsecase {
    constructor(
        @inject(TYPES.ISubscriptionPlanRepository)
        private readonly _subscriptionPlanRepository: ISubscriptionPlanRepository,
        @inject(TYPES.IUserSubscriptionRepository)
        private readonly _userSubscriptionRepository: IUserSubscriptionRepository,
        @inject(TYPES.IIdGeneratingService)
        private readonly _idGeneratingService: IIdGeneratingService,
    ) {}

    async execute(userId: string): Promise<Result<void>> {
        const planResult =
            await this._subscriptionPlanRepository.findActiveDefault();
        if (planResult.isFailure) {
            return Result.fail(planResult.getError());
        }

        const plan = planResult.getValue();
        if (!plan) {
            return Result.ok(undefined);
        }

        const now = new Date();
        const subResult = UserSubscription.create({
            id: this._idGeneratingService.generateId(),
            userId,
            subscriptionPlanId: plan.getId(),
            razorpaySubscriptionId: null,
            status: UserSubscriptionStatus.ACTIVE,
            startDate: now,
            endDate: USER_SUBSCRIPTION_INFINITE_END,
            createdAt: now,
            updatedAt: now,
        });

        if (subResult.isFailure) {
            return Result.fail(subResult.getError());
        }

        return this._userSubscriptionRepository.save(subResult.getValue());
    }
}
