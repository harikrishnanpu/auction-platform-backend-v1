import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { IRazorpaySubscriptionGatewayService } from '@application/interfaces/services/IRazorpaySubscriptionGatewayService';
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
        @inject(TYPES.IRazorpaySubscriptionGatewayService)
        private readonly _razorpaySubscriptionGateway: IRazorpaySubscriptionGatewayService,
    ) {}

    async assignDefaultSubscriptionToUser(
        userId: string,
    ): Promise<Result<void>> {
        const subscriptionPlan =
            await this._subscriptionPlanRepository.findActiveDefault();
        if (subscriptionPlan.isFailure)
            return Result.fail(subscriptionPlan.getError());

        const defaultSubscriptionPlan = subscriptionPlan.getValue();

        if (!defaultSubscriptionPlan)
            return Result.fail('Default subscription plan not found');

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

        const razorpaySubscription =
            await this._razorpaySubscriptionGateway.createSubscription({
                razorpayPlanId: defaultSubscriptionPlan.getRazorpayPlanId()!,
                customerId: userId,
                userSubscriptionId: usersubscriptionPlan.getValue().getId(),
                durationDays: defaultSubscriptionPlan.getDurationDays(),
                userId,
                appSubscriptionPlanId: defaultSubscriptionPlan.getId(),
            });

        if (razorpaySubscription.isFailure)
            return Result.fail(razorpaySubscription.getError());

        const saveRes = await this._userSubscriptionRepository.save(
            usersubscriptionPlan.getValue(),
        );
        if (saveRes.isFailure) return Result.fail(saveRes.getError());

        return Result.ok();
    }
}
