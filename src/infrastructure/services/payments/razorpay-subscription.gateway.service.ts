import {
    CreateRazorpayPlanGatewayInput,
    CreateRazorpaySubscriptionGatewayInput,
    CreateRazorpaySubscriptionGatewayOutput,
    EnsureRazorpayCustomerInput,
    IRazorpaySubscriptionGatewayService,
} from '@application/interfaces/services/IRazorpaySubscriptionGatewayService';
import { Result } from '@domain/shared/result';
import { injectable } from 'inversify';
import Razorpay from 'razorpay';

@injectable()
export class RazorpaySubscriptionGatewayService implements IRazorpaySubscriptionGatewayService {
    private readonly _razorpay: Razorpay;

    constructor() {
        const keyId = process.env.RAZORPAY_KEY_ID ?? '';
        const keySecret = process.env.RAZORPAY_KEY_SECRET ?? '';
        if (!keyId || !keySecret) {
            throw new Error('Razorpay keys are not configured');
        }
        this._razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });
    }

    async ensureCustomer(
        input: EnsureRazorpayCustomerInput,
    ): Promise<Result<{ customerId: string }>> {
        try {
            const contact = this.normalizeContact(input.phone);
            const customer = await this._razorpay.customers.create({
                name: input.name.slice(0, 50),
                email: input.email,
                contact: contact ?? undefined,
                fail_existing: 0,
                notes: { userId: input.userId },
            });
            return Result.ok({ customerId: customer.id });
        } catch (err) {
            console.log(err);
            return Result.fail('Razorpay customer error');
        }
    }

    async createPlan(
        input: CreateRazorpayPlanGatewayInput,
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
                    name: input.name.slice(0, 200),
                    amount: amountPaise,
                    currency: 'INR',
                    description: input.description.slice(0, 500),
                },
                period,
                interval,
                notes: { appPlanId: input.appPlanId },
            } as never);
            return Result.ok({ razorpayPlanId: plan.id });
        } catch (err) {
            console.log(err);
            return Result.fail('Razorpay plan create error');
        }
    }

    async createSubscription(
        input: CreateRazorpaySubscriptionGatewayInput,
    ): Promise<Result<CreateRazorpaySubscriptionGatewayOutput>> {
        try {
            const sub = await this._razorpay.subscriptions.create({
                plan_id: input.razorpayPlanId,
                customer_id: input.customerId,
                customer_notify: 1,
                total_count: 240,
                quantity: 1,
                notes: {
                    userSubscriptionId: input.userSubscriptionId,
                    userId: input.userId,
                    appSubscriptionPlanId: input.appSubscriptionPlanId,
                },
            } as never);

            return Result.ok({
                razorpaySubscriptionId: sub.id,
                shortUrl: sub.short_url,
            });
        } catch (err) {
            console.log(err);
            return Result.fail('Razorpay subscription create error');
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

    private normalizeContact(phone: string | null): string | undefined {
        if (!phone?.trim()) return undefined;
        const digits = phone.replace(/\D/g, '');
        if (!digits.length) return undefined;
        return digits.slice(-15);
    }
}
