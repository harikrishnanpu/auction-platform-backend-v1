import {
    CreateRazorpayPlanInput,
    CreateRazorpaySubscriptionInput,
    CreateRazorpaySubscriptionOutput,
    EnsureRazorpayCustomerInput,
    IRazorpaySubscriptionGatewayService,
} from '@application/interfaces/services/IRazorpaySubscriptionGatewayService';
import { Result } from '@domain/shared/result';
import Razorpay from 'razorpay';
import crypto, { BinaryLike } from 'crypto';
import { IsubcriptionWebhookEventHandleInputDto } from '@application/interfaces/usecases/webhooks/IRazpSubscriptionWebhookhandlerUsecase';
import { UserSubscription } from '@domain/entities/subscription/user-subscription.entity';
import { TYPES } from '@di/types.di';
import { IUserSubscriptionRepository } from '@domain/repositories/IUserSubscriptionRepository';
import { inject, injectable } from 'inversify';

// type RazorpayCustomer = {
//     id: string;
//     name?: string;
//     email?: string;
//   };

// ubscriptions =--- {
//     id: 'sub_SqIW2j7mkQ8vWS',
//     entity: 'subscription',
//     plan_id: 'plan_SpWDrvQiSfTq1x',
//     customer_id: null,
//     customer_email: null,
//     customer_contact: null,
//     status: 'created',
//     current_start: null,
//     current_end: null,
//     ended_at: null,
//     quantity: 1,
//     notes: {
//       userSubscriptionId: '6b235d65-b82e-475c-827a-ad3b8eaeed68',
//       userId: '4a3b3c66-9e4a-4bfa-8872-c5c41c12353e',
//       appSubscriptionPlanId: '7fe77175-ac25-4db2-aa7f-c5f6d8a53c62'
//     },
//     charge_at: null,
//     start_at: null,
//     end_at: null,
//     auth_attempts: 0,
//     total_count: 12,
//     paid_count: 0,
//     customer_notify: true,
//     created_at: 1778991718,
//     expire_by: null,
//     short_url: 'https://rzp.io/rzp/Gfsg2FT',
//     has_scheduled_changes: false,
//     change_scheduled_at: null,
//     source: 'api',
//     payment_method: null,
//     offer_id: null,
//     halted_at: null,
//     remaining_count: 11
//   }

@injectable()
export class RazorpaySubscriptionGatewayService implements IRazorpaySubscriptionGatewayService {
    private readonly _razorpay: Razorpay;
    private readonly _webhookSecret: string;

    constructor(
        @inject(TYPES.IUserSubscriptionRepository)
        private readonly _userSubscriptionRepository: IUserSubscriptionRepository,
    ) {
        const keyId = process.env.RAZORPAY_KEY_ID ?? '';
        const keySecret = process.env.RAZORPAY_KEY_SECRET ?? '';
        this._webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET ?? '';

        if (!keyId || !keySecret || !this._webhookSecret) {
            throw new Error('Razorpay keys are not configured');
        }

        this._razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });
    }

    async findSubscriptionBySubscriptionId(
        razorpaySubscriptionId: string,
    ): Promise<Result<UserSubscription | null>> {
        try {
            console.log('razorpaySubscriptionId =---', razorpaySubscriptionId);

            const subscriptions = await this._razorpay.subscriptions.fetch(
                razorpaySubscriptionId,
            );

            console.log('subscriptions =---', subscriptions);

            const isActive =
                subscriptions.paid_count >= 1 &&
                (subscriptions.status === 'active' ||
                    subscriptions.status === 'created');

            if (!isActive) {
                return Result.ok(null);
            }

            const dbSubscription =
                await this._userSubscriptionRepository.findByRazorpaySubscriptionId(
                    razorpaySubscriptionId,
                );

            if (dbSubscription.isFailure) {
                return Result.fail(dbSubscription.getError());
            }

            const dbSubscriptionEntity = dbSubscription.getValue();

            if (!dbSubscriptionEntity) {
                return Result.ok(null);
            }

            return Result.ok(dbSubscriptionEntity);
        } catch (err) {
            console.log(err);
            return Result.fail('Razorpay subscription find error');
        }
    }

    async getRazorpayCustomer(
        input: EnsureRazorpayCustomerInput,
    ): Promise<Result<{ customerId: string }>> {
        try {
            console.log('input =---', input);

            if (
                input.razorpayCustomerId &&
                input.razorpayCustomerId.trim() !== ''
            ) {
                try {
                    const customer = await this._razorpay.customers.fetch(
                        input.razorpayCustomerId,
                    );

                    console.log('existing customer -- customer =---', customer);

                    if (customer?.id) {
                        return Result.ok({ customerId: customer.id });
                    }
                } catch (err) {
                    console.log(
                        'Invalid razorpay customer id, creating new one',
                        err,
                    );
                    return Result.fail(
                        'Invalid razorpay customer id, creating new one',
                    );
                }
            }

            //   const existingCustomers = await this._razorpay.customers.all({
            //     count: 100,
            //   })

            //   console.log('existingCustomers =---', existingCustomers);

            //   const existing = existingCustomers.items.find((c: RazorpayCustomer) => {
            //     return (
            //       c.email === input.email
            //     );
            //   });

            //   if (existing) {
            //     return Result.ok({ customerId: existing.id });
            //   }

            const customer = await this._razorpay.customers.create({
                name: input.name,
                email: input.email,
                contact: `+91${input.phone}`,
                fail_existing: 0,
                notes: {
                    userId: input.userId,
                },
            });

            console.log('new customer -- customer =---', customer);

            return Result.ok({ customerId: customer.id });
        } catch (err) {
            console.log(err);
            return Result.fail('razorpay customer error');
        }
    }

    async createPlan(
        input: CreateRazorpayPlanInput,
    ): Promise<Result<{ razorpayPlanId: string }>> {
        try {
            const amountPaise = Math.round(input.amountRupees * 100);

            if (amountPaise < 100) {
                return Result.fail('Plan amount must be at least ₹1');
            }

            const { period, interval } = this.mapDurationDaysToBilling(
                input.durationDays,
            );

            const plan = await this._razorpay.plans.create({
                item: {
                    name: input.name,
                    amount: amountPaise,
                    currency: 'INR',
                    description: input.description,
                },
                period,
                interval,
                notes: { appPlanId: input.appPlanId },
            });

            return Result.ok({ razorpayPlanId: plan.id });
        } catch (err) {
            console.log(err);
            return Result.fail('Razorpay plan create error');
        }
    }

    async createSubscription(
        input: CreateRazorpaySubscriptionInput,
    ): Promise<Result<CreateRazorpaySubscriptionOutput>> {
        try {
            console.log('input =---', input);

            const sub = await this._razorpay.subscriptions.create({
                plan_id: input.razorpayPlanId,
                customer_notify: 1,
                total_count: 12,
                quantity: 1,
                notes: {
                    userSubscriptionId: input.userSubscriptionId,
                    userId: input.userId,
                    appSubscriptionPlanId: input.appSubscriptionPlanId,
                },
            });

            console.log('sub =---', sub);

            return Result.ok({
                razorpaySubscriptionId: sub.id,
                shortUrl: sub.short_url,
            });
        } catch (err) {
            console.log(err);
            return Result.fail('Razorpay subscription create error');
        }
    }

    async verifySubscriptionWebhookEvent(
        input: BinaryLike,
        signature: string,
        eventId: string,
    ): Promise<Result<IsubcriptionWebhookEventHandleInputDto>> {
        try {
            if (!eventId || !signature) {
                return Result.fail('Event id or signature is missing');
            }

            const rawBody = input; // Buffer

            const expectedSignature = crypto
                .createHmac('sha256', this._webhookSecret)
                .update(rawBody)
                .digest('hex');

            if (expectedSignature !== signature) {
                console.log('EXPECTED:', expectedSignature);
                console.log('RECEIVED:', signature);
                return Result.fail('Invalid signature');
            }

            const event = JSON.parse(rawBody.toString());

            console.log('what is this: ', event);

            const { validateWebhookSignature } =
                await import('razorpay/dist/utils/razorpay-utils');

            const isValid = validateWebhookSignature(
                rawBody as unknown as string,
                signature,
                this._webhookSecret,
            );

            if (!isValid) {
                return Result.fail(
                    'Invalid subscription webhook event signature',
                );
            }

            return Result.ok({
                event: event.event,
                subscriptionId: event.payload.subscription.entity.id,
                headers: {
                    'x-razorpay-event-id': eventId,
                    'x-razorpay-signature': signature,
                },
            });
        } catch (err) {
            console.log(err);
            return Result.fail(
                'Razorpay subscription webhook event verify error',
            );
        }
    }

    private mapDurationDaysToBilling(durationDays: number): {
        period: 'daily' | 'weekly' | 'monthly' | 'yearly';
        interval: number;
    } {
        const d = Math.max(1, Math.floor(durationDays));
        if (d >= 300)
            return {
                period: 'yearly',
                interval: Math.max(1, Math.round(d / 365)),
            };
        if (d >= 25)
            return {
                period: 'monthly',
                interval: Math.max(1, Math.round(d / 30)),
            };
        if (d >= 7)
            return {
                period: 'weekly',
                interval: Math.max(1, Math.round(d / 7)),
            };
        return { period: 'daily', interval: d };
    }
}
