import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { ISubscriptionService } from '@application/interfaces/services/ISubscriptionService';
import { TYPES } from '@di/types.di';
import {
    UserSubscription,
    UserSubscriptionStatus,
} from '@domain/entities/subscription/user-subscription.entity';
import { ISubscriptionPlanRepository } from '@domain/repositories/ISubscriptionPlanRepository';
import { IUserSubscriptionRepository } from '@domain/repositories/IUserSubscriptionRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class SubscriptionService implements ISubscriptionService {
    constructor(
        @inject(TYPES.ISubscriptionPlanRepository)
        private readonly _subscriptionPlanRepository: ISubscriptionPlanRepository,
        @inject(TYPES.IIdGeneratingService)
        private readonly _idGeneratingService: IIdGeneratingService,
        @inject(TYPES.IUserSubscriptionRepository)
        private readonly _userSubscriptionRepository: IUserSubscriptionRepository,
    ) {}

    async assignDefaultSubscriptionToUser(
        userId: string,
    ): Promise<Result<UserSubscription>> {
        console.log('subscription plan Assigned test 1');

        const existingUserSubscription =
            await this._userSubscriptionRepository.findCurrentActiveByUserId(
                userId,
            );
        if (existingUserSubscription.isFailure) {
            return Result.fail(existingUserSubscription.getError());
        }
        const existingUserSubscriptionEntity =
            existingUserSubscription.getValue();
        if (existingUserSubscriptionEntity) {
            return Result.ok(existingUserSubscriptionEntity);
        }

        const subscriptionPlan =
            await this._subscriptionPlanRepository.findActiveDefault();

        if (subscriptionPlan.isFailure)
            return Result.fail(subscriptionPlan.getError());

        const defaultSubscriptionPlan = subscriptionPlan.getValue();

        // chnage -----
        if (!defaultSubscriptionPlan) {
            return Result.ok();
        }

        const usersubscriptionPlan = UserSubscription.create({
            id: this._idGeneratingService.generateId(),
            userId,
            subscriptionPlanId: defaultSubscriptionPlan.getId(),
            status: UserSubscriptionStatus.ACTIVE,
            startDate: new Date(),
            endDate: new Date(
                new Date().getTime() + 100000 * 24 * 60 * 60 * 1000,
            ),
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        if (usersubscriptionPlan.isFailure)
            return Result.fail(usersubscriptionPlan.getError());

        console.log(defaultSubscriptionPlan);

        const saveRes = await this._userSubscriptionRepository.save(
            usersubscriptionPlan.getValue(),
        );

        console.log('subscription plan Assigned test 2');

        if (saveRes.isFailure) {
            console.log('error razrpy');
            return Result.fail(saveRes.getError());
        }

        return Result.ok(saveRes.getValue());
    }
}
