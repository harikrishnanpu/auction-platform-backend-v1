import { IRazorpaySubscriptionGatewayService } from '@application/interfaces/services/IRazorpaySubscriptionGatewayService';
import { IRazorpaySubscriptionWebhookHandlerUsecase } from '@application/interfaces/usecases/webhooks/IRazpSubscriptionWebhookhandlerUsecase';
import { TYPES } from '@di/types.di';
import { UserSubscriptionStatus } from '@domain/entities/subscription/user-subscription.entity';
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

            if (!razorpayEvent.event.trim())
                return Result.fail('Razorpay webhook event is missing');

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

            const existingUserSubscriptionEntity =
                userSubscriptionRes.getValue();
            if (!existingUserSubscriptionEntity) return Result.ok(undefined);

            await this._userSubscriptionRepository.expireAllActiveForUser(
                existingUserSubscriptionEntity.getUserId(),
            );

            const newDomainStatus = this.mapEventToDomainStatus(
                razorpayEvent.event,
            );

            if (!newDomainStatus) return Result.ok(undefined);
            if (
                existingUserSubscriptionEntity.getStatus() === newDomainStatus
            ) {
                return Result.ok(undefined);
            }

            const subscriptionPlanEntityRes =
                await this._subscriptionPlanRepository.findById(
                    existingUserSubscriptionEntity.getSubscriptionPlanId(),
                );
            if (subscriptionPlanEntityRes.isFailure)
                return Result.fail(subscriptionPlanEntityRes.getError());
            const subscriptionPlanEntity = subscriptionPlanEntityRes.getValue();
            if (!subscriptionPlanEntity)
                return Result.fail('Subscription plan not found');

            const now = new Date();
            const newEndDate = new Date(now);
            newEndDate.setDate(
                now.getDate() + subscriptionPlanEntity.getDurationDays(),
            );
            existingUserSubscriptionEntity.setStatus(newDomainStatus);
            existingUserSubscriptionEntity.setEndDate(newEndDate);

            const saveRes = await this._userSubscriptionRepository.save(
                existingUserSubscriptionEntity,
            );

            if (saveRes.isFailure) return Result.fail(saveRes.getError());
            return Result.ok();
        } catch (err) {
            console.log(err);
            return Result.fail('Razorpay subscription webhook handling failed');
        }
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
                return UserSubscriptionStatus.EXPIRED;
            default:
                return null;
        }
    }
}
