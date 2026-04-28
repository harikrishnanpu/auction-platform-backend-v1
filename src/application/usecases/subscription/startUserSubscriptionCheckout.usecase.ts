import { StartSubscriptionCheckoutOutputDto } from '@application/dtos/user/startSubscriptionCheckout.dto';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { IRazorpaySubscriptionGatewayService } from '@application/interfaces/services/IRazorpaySubscriptionGatewayService';
import { IStartUserSubscriptionCheckoutUsecase } from '@application/interfaces/usecases/subscription/IStartUserSubscriptionCheckoutUsecase';
import { TYPES } from '@di/types.di';
import { UserSubscriptionStatus } from '@domain/entities/subscription/user-subscription.entity';
import { UserSubscription } from '@domain/entities/subscription/user-subscription.entity';
import { ISubscriptionPlanRepository } from '@domain/repositories/ISubscriptionPlanRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { IUserSubscriptionRepository } from '@domain/repositories/IUserSubscriptionRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class StartUserSubscriptionCheckoutUsecase implements IStartUserSubscriptionCheckoutUsecase {
    constructor(
        @inject(TYPES.ISubscriptionPlanRepository)
        private readonly _subscriptionPlanRepository: ISubscriptionPlanRepository,
        @inject(TYPES.IUserSubscriptionRepository)
        private readonly _userSubscriptionRepository: IUserSubscriptionRepository,
        @inject(TYPES.IUserRepository)
        private readonly _userRepository: IUserRepository,
        @inject(TYPES.IRazorpaySubscriptionGatewayService)
        private readonly _razorpaySubscriptionGateway: IRazorpaySubscriptionGatewayService,
        @inject(TYPES.IIdGeneratingService)
        private readonly _idGeneratingService: IIdGeneratingService,
    ) {}

    async execute(
        userId: string,
        subscriptionPlanId: string,
    ): Promise<Result<StartSubscriptionCheckoutOutputDto>> {
        const planRes =
            await this._subscriptionPlanRepository.findById(subscriptionPlanId);
        if (planRes.isFailure) {
            return Result.fail(planRes.getError());
        }
        const plan = planRes.getValue();
        if (
            !plan ||
            !plan.getIsActive() ||
            plan.getIsDefault() ||
            plan.getPrice() <= 0 ||
            !plan.getRazorpayPlanId()?.trim()
        ) {
            return Result.fail(
                'Subscription plan is not available for checkout',
            );
        }

        const userRes = await this._userRepository.findById(userId);
        if (userRes.isFailure) {
            return Result.fail(userRes.getError());
        }
        const user = userRes.getValue();

        const expireRes =
            await this._userSubscriptionRepository.expireAllActiveForUser(
                userId,
            );
        if (expireRes.isFailure) {
            return Result.fail(expireRes.getError());
        }

        const now = new Date();
        const endGuess = new Date(now);
        endGuess.setDate(endGuess.getDate() + plan.getDurationDays());

        const subId = this._idGeneratingService.generateId();
        const subEntity = UserSubscription.create({
            id: subId,
            userId,
            subscriptionPlanId: plan.getId(),
            razorpaySubscriptionId: null,
            status: UserSubscriptionStatus.PENDING,
            startDate: now,
            endDate: endGuess,
            createdAt: now,
            updatedAt: now,
        });
        if (subEntity.isFailure) {
            return Result.fail(subEntity.getError());
        }

        const saveRes = await this._userSubscriptionRepository.save(
            subEntity.getValue(),
        );
        if (saveRes.isFailure) {
            return Result.fail(saveRes.getError());
        }

        const customerRes =
            await this._razorpaySubscriptionGateway.ensureCustomer({
                userId,
                name: user.getName(),
                email: user.getEmail().getValue(),
                phone: user.getPhone()?.getValue() ?? null,
            });
        if (customerRes.isFailure) {
            return Result.fail(customerRes.getError());
        }

        const rzSubRes =
            await this._razorpaySubscriptionGateway.createSubscription({
                razorpayPlanId: plan.getRazorpayPlanId()!,
                customerId: customerRes.getValue().customerId,
                userSubscriptionId: subId,
                userId,
                appSubscriptionPlanId: plan.getId(),
            });
        if (rzSubRes.isFailure) {
            return Result.fail(rzSubRes.getError());
        }

        const rz = rzSubRes.getValue();
        const current = subEntity.getValue();
        const withRz = UserSubscription.create({
            id: current.getId(),
            userId: current.getUserId(),
            subscriptionPlanId: current.getSubscriptionPlanId(),
            razorpaySubscriptionId: rz.razorpaySubscriptionId,
            status: current.getStatus(),
            startDate: current.getStartDate(),
            endDate: current.getEndDate(),
            createdAt: current.getCreatedAt(),
            updatedAt: new Date(),
        });
        if (withRz.isFailure) {
            return Result.fail(withRz.getError());
        }

        const updateRes = await this._userSubscriptionRepository.update(
            withRz.getValue(),
        );
        if (updateRes.isFailure) {
            return Result.fail(updateRes.getError());
        }

        const keyId = process.env.RAZORPAY_KEY_ID ?? '';
        if (!keyId) {
            return Result.fail('Razorpay key id is not configured');
        }

        return Result.ok({
            userSubscriptionId: subId,
            razorpaySubscriptionId: rz.razorpaySubscriptionId,
            shortUrl: rz.shortUrl,
            razorpayKeyId: keyId,
        });
    }
}
