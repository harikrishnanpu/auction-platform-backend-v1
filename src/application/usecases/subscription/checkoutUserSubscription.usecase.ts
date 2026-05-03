import { StartSubscriptionCheckoutOutputDto } from '@application/dtos/user/startSubscriptionCheckout.dto';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { IRazorpaySubscriptionGatewayService } from '@application/interfaces/services/IRazorpaySubscriptionGatewayService';
import { ICheckoutUserSubscriptionUsecase } from '@application/interfaces/usecases/subscription/ICheckoutUserSubscription';
import { TYPES } from '@di/types.di';
import { UserSubscriptionStatus } from '@domain/entities/subscription/user-subscription.entity';
import { UserSubscription } from '@domain/entities/subscription/user-subscription.entity';
import { ISubscriptionPlanRepository } from '@domain/repositories/ISubscriptionPlanRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { IUserSubscriptionRepository } from '@domain/repositories/IUserSubscriptionRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class checkoutUserSubscriptionUsecase implements ICheckoutUserSubscriptionUsecase {
    constructor(
        @inject(TYPES.ISubscriptionPlanRepository)
        private readonly _subscriptionPlanRepository: ISubscriptionPlanRepository,
        @inject(TYPES.IUserSubscriptionRepository)
        private readonly _userSubscriptionRepository: IUserSubscriptionRepository,
        @inject(TYPES.IUserRepository)
        private readonly _userRepository: IUserRepository,
        @inject(TYPES.IRazorpaySubscriptionGatewayService)
        // change ---
        private readonly _razorpaySubscriptionGateway: IRazorpaySubscriptionGatewayService,
        @inject(TYPES.IIdGeneratingService)
        private readonly _idGeneratingService: IIdGeneratingService,
    ) {}

    async execute({
        userId,
        subscriptionPlanId,
    }: {
        userId: string;
        subscriptionPlanId: string;
    }): Promise<Result<StartSubscriptionCheckoutOutputDto>> {
        const currentUserSubscriptionRes =
            await this._userSubscriptionRepository.getByUserId(userId);

        if (currentUserSubscriptionRes.isFailure) {
            return Result.fail(currentUserSubscriptionRes.getError());
        }

        const currentUserSubscription = currentUserSubscriptionRes.getValue();

        if (!currentUserSubscription) {
            return Result.fail(
                'something went wrong =-- default plan is not asnged',
            );
        }

        if (
            currentUserSubscription.getSubscriptionPlanId() ===
                subscriptionPlanId &&
            currentUserSubscription.getStatus() ===
                UserSubscriptionStatus.ACTIVE &&
            currentUserSubscription.getEndDate() > new Date()
        ) {
            return Result.fail('User is already subscribed to this plan');
        }

        const subscriptionPlanRes =
            await this._subscriptionPlanRepository.findById(subscriptionPlanId);

        if (subscriptionPlanRes.isFailure) {
            return Result.fail(subscriptionPlanRes.getError());
        }

        const newSubscriptionPlanEntity = subscriptionPlanRes.getValue();

        if (!newSubscriptionPlanEntity) {
            return Result.fail('Subscription plan not found');
        }

        if (
            !newSubscriptionPlanEntity.getIsActive() ||
            !newSubscriptionPlanEntity.getRazorpayPlanId()
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

        const now = new Date();
        const end = new Date(now);
        end.setDate(
            end.getDate() + newSubscriptionPlanEntity.getDurationDays(),
        );

        const customerRes =
            await this._razorpaySubscriptionGateway.getRazorpayCustomer({
                userId,
                razorpayCustomerId: user.getRazorpayCustomerId() ?? null,
                name: user.getName(),
                email: user.getEmail().getValue(),
                phone: user.getPhone()?.getValue() ?? '',
            });

        if (customerRes.isFailure) {
            return Result.fail(customerRes.getError());
        }

        const razorPayCustomer = customerRes.getValue();

        user.setRazorpayCustomerId(razorPayCustomer.customerId);

        const razorpaySubscriptionRes =
            await this._razorpaySubscriptionGateway.createSubscription({
                razorpayPlanId: newSubscriptionPlanEntity.getRazorpayPlanId()!,
                customerId: razorPayCustomer.customerId,
                userSubscriptionId: newSubscriptionPlanEntity.getId(),
                userId,
                appSubscriptionPlanId: newSubscriptionPlanEntity.getId(),
                durationDays: newSubscriptionPlanEntity.getDurationDays(),
            });

        if (razorpaySubscriptionRes.isFailure) {
            return Result.fail(razorpaySubscriptionRes.getError());
        }

        const currRazorpaySubscription = razorpaySubscriptionRes.getValue();

        const newUserSubscriptionEntity = UserSubscription.create({
            id: this._idGeneratingService.generateId(),
            userId: userId,
            subscriptionPlanId: newSubscriptionPlanEntity.getId(),
            razorpaySubscriptionId:
                currRazorpaySubscription.razorpaySubscriptionId,
            status: UserSubscriptionStatus.PENDING,
            startDate: now,
            endDate: end,
            createdAt: now,
            updatedAt: now,
        });

        if (newUserSubscriptionEntity.isFailure) {
            return Result.fail(newUserSubscriptionEntity.getError());
        }

        const updateUserRes = await this._userRepository.save(user);

        if (updateUserRes.isFailure) {
            return Result.fail(updateUserRes.getError());
        }

        const updateRes = await this._userSubscriptionRepository.save(
            newUserSubscriptionEntity.getValue(),
        );

        if (updateRes.isFailure) {
            return Result.fail(updateRes.getError());
        }

        const keyId = process.env.RAZORPAY_KEY_ID ?? '';

        if (!keyId) {
            return Result.fail('Razorpay key id is not configured');
        }

        return Result.ok({
            userSubscriptionId: newUserSubscriptionEntity.getValue().getId(),
            razorpaySubscriptionId:
                currRazorpaySubscription.razorpaySubscriptionId,
            shortUrl: currRazorpaySubscription.shortUrl,
            razorpayKeyId: process.env.RAZORPAY_KEY_ID ?? '',
        });
    }
}
