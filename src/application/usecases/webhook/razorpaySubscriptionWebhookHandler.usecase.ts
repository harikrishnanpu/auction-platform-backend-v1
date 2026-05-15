import {
    USER_SUBSCRIPTION_INFINITE_END,
    USER_SUBSCRIPTION_PLAN_UPGRADATION_REFUND_MAX_TIME,
} from '@application/constants/subscription/subscription.constants';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { IRazorpaySubscriptionGatewayService } from '@application/interfaces/services/IRazorpaySubscriptionGatewayService';
import { IWalletService } from '@application/interfaces/services/IWalletService';
import { IRazorpaySubscriptionWebhookHandlerUsecase } from '@application/interfaces/usecases/webhooks/IRazpSubscriptionWebhookhandlerUsecase';
import { TYPES } from '@di/types.di';
import {
    UserSubscription,
    UserSubscriptionStatus,
} from '@domain/entities/subscription/user-subscription.entity';
import { ISubscriptionPlanRepository } from '@domain/repositories/ISubscriptionPlanRepository';
import { IUserSubscriptionRepository } from '@domain/repositories/IUserSubscriptionRepository';
import { Result } from '@domain/shared/result';
import { BinaryLike } from 'crypto';
import { inject, injectable } from 'inversify';

// interface RazorpayWebhookEvent {
//     event: string;
//     payload: {
//         subscription: {
//             entity: {
//                 id: string;
//             };
//         };
//     };
// }

@injectable()
export class RazorpaySubscriptionWebhookHandlerUsecase implements IRazorpaySubscriptionWebhookHandlerUsecase {
    constructor(
        @inject(TYPES.IUserSubscriptionRepository)
        private readonly _userSubscriptionRepository: IUserSubscriptionRepository,
        @inject(TYPES.ISubscriptionPlanRepository)
        private readonly _subscriptionPlanRepository: ISubscriptionPlanRepository,
        @inject(TYPES.IRazorpaySubscriptionGatewayService)
        private readonly _razorpayGatewayService: IRazorpaySubscriptionGatewayService,
        @inject(TYPES.IWalletService)
        private readonly _walletService: IWalletService,
        @inject(TYPES.IIdGeneratingService)
        private readonly _idGeneratingService: IIdGeneratingService,
    ) {}

    // webhook RRZPAYY =--- {
    //     entity: 'event',
    //     account_id: 'acc_QmG1Gmh63UwVgR',
    //     event: 'subscription.activated',
    //     contains: [ 'subscription', 'payment' ],
    //     payload: { subscription: { entity: [Object] }, payment: { entity: [Object] } },
    //     created_at:   created_at: 1777661624
    // }

    //       'x-razorpay-event-id': 'SkCsoNygtQKG8R',
    //   'x-razorpay-signature': 'e4fdf5e61c7645819be0d242403373ec83bcb1fb31035a91fccc7bbc23abf441'

    public async execute(
        input: BinaryLike,
        { signature, eventId }: { signature: string; eventId: string },
    ): Promise<Result<void>> {
        try {
            console.log('eventName =---', input);
            // console.log("razorpayEvent =---", razorpayEvent);
            // return;

            // const razorpayEventId = input.headers['x-razorpay-event-id'];
            // const razorpaySignature = input.headers['x-razorpay-signature'];

            // if (!razorpayEventId || !razorpaySignature) {
            //     return Result.fail('Razorpay event id or signature is missing in webhook headers');
            // }

            const razorpayEventResult =
                await this._razorpayGatewayService.verifySubscriptionWebhookEvent(
                    input,
                    signature,
                    eventId,
                );

            if (razorpayEventResult.isFailure) {
                return Result.fail(razorpayEventResult.getError());
            }

            const razorpayEvent = razorpayEventResult.getValue();

            const razorpaySubscriptionId = razorpayEvent.subscriptionId;

            if (!razorpayEvent.event.trim()) {
                return Result.fail('Razorpay webhook event is missing');
            }

            if (!razorpaySubscriptionId) {
                return Result.fail(
                    'Razorpay subscription id is missing in webhook payload',
                );
            }

            const userSubscriptionRes =
                await this._userSubscriptionRepository.findByRazorpaySubscriptionId(
                    razorpaySubscriptionId,
                );

            if (userSubscriptionRes.isFailure) {
                return Result.fail(userSubscriptionRes.getError());
            }

            const existingUserSubscriptionPendingEntity =
                userSubscriptionRes.getValue();

            if (!existingUserSubscriptionPendingEntity) {
                return Result.fail('User subscription not found');
            }

            const newDomainStatus = this.mapEventToDomainStatus(
                razorpayEvent.event,
            );

            if (!newDomainStatus) {
                return Result.fail('Invalid event name');
            }

            const STATUSES_ALLOWED_TO_ACTIVE = [
                UserSubscriptionStatus.PENDING,
                UserSubscriptionStatus.PAYMENT_FAILED,
                UserSubscriptionStatus.ACTIVE,
            ];

            if (
                newDomainStatus === UserSubscriptionStatus.ACTIVE &&
                !STATUSES_ALLOWED_TO_ACTIVE.includes(
                    existingUserSubscriptionPendingEntity.getStatus(),
                )
            ) {
                return Result.ok(undefined);
            }

            const subscriptionPlanEntityRes =
                await this._subscriptionPlanRepository.findById(
                    existingUserSubscriptionPendingEntity.getSubscriptionPlanId(),
                );

            if (subscriptionPlanEntityRes.isFailure) {
                return Result.fail(subscriptionPlanEntityRes.getError());
            }

            const subscriptionPlanEntity = subscriptionPlanEntityRes.getValue();
            if (!subscriptionPlanEntity) {
                return Result.fail('Subscription plan not found');
            }

            const now = new Date();

            if (newDomainStatus === UserSubscriptionStatus.ACTIVE) {
                const activeSubscriptionRes =
                    await this._userSubscriptionRepository.findCurrentActiveByUserId(
                        existingUserSubscriptionPendingEntity.getUserId(),
                    );

                if (activeSubscriptionRes.isFailure) {
                    return Result.fail(activeSubscriptionRes.getError());
                }

                const existingActiveUserSubscription =
                    activeSubscriptionRes.getValue();

                if (
                    existingActiveUserSubscription &&
                    existingActiveUserSubscription.getId() !==
                        existingUserSubscriptionPendingEntity.getId()
                ) {
                    const existingActivePlanRes =
                        await this._subscriptionPlanRepository.findById(
                            existingActiveUserSubscription.getSubscriptionPlanId(),
                        );

                    console.log(
                        'existingActivePlanRes =---',
                        existingActivePlanRes,
                    );

                    if (existingActivePlanRes.isFailure) {
                        return Result.fail(existingActivePlanRes.getError());
                    }
                    const existingActivePlan = existingActivePlanRes.getValue();

                    if (!existingActivePlan) {
                        return Result.fail(
                            'Existing active subscription plan not found',
                        );
                    }

                    const refundAmount = this.calculateRemainingPlanRefund(
                        existingActiveUserSubscription.getStartDate(),
                        existingActiveUserSubscription.getEndDate(),
                        existingActivePlan.getPrice(),
                        now,
                    );

                    if (refundAmount > 0) {
                        const walletRes =
                            await this._walletService.creditWallet(
                                existingUserSubscriptionPendingEntity.getUserId(),
                                refundAmount,
                            );

                        if (walletRes.isFailure) {
                            return Result.fail(walletRes.getError());
                        }

                        // const creditRes =
                        //     await this._creditWalletUsecase.execute({
                        //         userId: existingUserSubscriptionPendingEntity.getUserId(),
                        //         amount: refundAmount,
                        //     });
                        //
                        // if (creditRes.isFailure) {
                        //     return Result.fail(creditRes.getError());
                        // }
                    }

                    existingActiveUserSubscription.setStatus(
                        UserSubscriptionStatus.EXPIRED,
                    );

                    existingActiveUserSubscription.setEndDate(now);

                    const expireOldRes =
                        await this._userSubscriptionRepository.save(
                            existingActiveUserSubscription,
                        );

                    if (expireOldRes.isFailure) {
                        return Result.fail(expireOldRes.getError());
                    }
                }

                existingUserSubscriptionPendingEntity.setStatus(
                    UserSubscriptionStatus.ACTIVE,
                );
                existingUserSubscriptionPendingEntity.setStartDate(now);
                existingUserSubscriptionPendingEntity.setEndDate(
                    new Date(
                        now.getTime() +
                            subscriptionPlanEntity.getDurationDays() *
                                24 *
                                60 *
                                60 *
                                1000,
                    ),
                );
            } else if (newDomainStatus === UserSubscriptionStatus.EXPIRED) {
                existingUserSubscriptionPendingEntity.setStatus(
                    UserSubscriptionStatus.EXPIRED,
                );
                existingUserSubscriptionPendingEntity.setEndDate(now);

                const defaultPlanRes =
                    await this._subscriptionPlanRepository.findActiveDefault();
                if (defaultPlanRes.isFailure) {
                    return Result.fail(defaultPlanRes.getError());
                }

                const defaultPlan = defaultPlanRes.getValue();
                console.log('defaultPlan =---', defaultPlan);
                if (!defaultPlan) {
                    return Result.ok(undefined);
                }

                const defaultUserSubscriptionEntity = UserSubscription.create({
                    id: this._idGeneratingService.generateId(),
                    userId: existingUserSubscriptionPendingEntity.getUserId(),
                    subscriptionPlanId: defaultPlan.getId(),
                    status: UserSubscriptionStatus.ACTIVE,
                    startDate: now,
                    endDate: USER_SUBSCRIPTION_INFINITE_END,
                    createdAt: now,
                    updatedAt: now,
                });

                if (defaultUserSubscriptionEntity.isFailure) {
                    return Result.fail(
                        defaultUserSubscriptionEntity.getError(),
                    );
                }

                const saveDefaultUserSubscriptionRes =
                    await this._userSubscriptionRepository.save(
                        defaultUserSubscriptionEntity.getValue(),
                    );
                if (saveDefaultUserSubscriptionRes.isFailure) {
                    return Result.fail(
                        saveDefaultUserSubscriptionRes.getError(),
                    );
                }

                // return Result.ok(undefined);
            }

            const saveRes = await this._userSubscriptionRepository.save(
                existingUserSubscriptionPendingEntity,
            );

            if (saveRes.isFailure) return Result.fail(saveRes.getError());

            console.log(
                'existingUserSubscriptionPendingEntity =---',
                existingUserSubscriptionPendingEntity,
            );

            return Result.ok();
        } catch (err) {
            console.log(err);
            return Result.fail('Razorpay subscription webhook handling failed');
        }
    }

    private calculateRemainingPlanRefund(
        startDate: Date,
        endDate: Date,
        planPrice: number,
        now: Date,
    ): number {
        if (planPrice <= 0) return 0;
        if (endDate <= now) return 0;

        const totalMs = endDate.getTime() - startDate.getTime();
        const remainingMs = endDate.getTime() - now.getTime();

        if (remainingMs <= USER_SUBSCRIPTION_PLAN_UPGRADATION_REFUND_MAX_TIME)
            return 0;

        if (totalMs <= 0 || remainingMs <= 0) return 0;

        const proratedAmount = planPrice * (remainingMs / totalMs);
        return Math.max(0, Math.floor(proratedAmount));
    }

    private mapEventToDomainStatus(
        eventName: string,
    ): UserSubscriptionStatus | null {
        switch (eventName) {
            case 'subscription.authenticated':
            case 'subscription.activated':
            case 'subscription.charged':
            case 'subscription.resumed':
                return UserSubscriptionStatus.ACTIVE;

            case 'subscription.pending':
                return UserSubscriptionStatus.PENDING;

            case 'subscription.halted':
            case 'subscription.cancelled':
            case 'subscription.completed':
            case 'subscription.paused':
                return UserSubscriptionStatus.EXPIRED;

            default:
                return null;
        }
    }
}
