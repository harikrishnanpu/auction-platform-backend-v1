import { Result } from '@domain/shared/result';
import { BinaryLike } from 'crypto';
import { IsubcriptionWebhookEventHandleInputDto } from '../usecases/webhooks/IRazpSubscriptionWebhookhandlerUsecase';

export interface EnsureRazorpayCustomerInput {
    razorpayCustomerId: string | null;
    userId: string;
    name: string;
    email: string;
    phone: string;
}

export interface CreateRazorpaySubscriptionInput {
    razorpayPlanId: string;
    customerId: string;
    userSubscriptionId: string;
    durationDays: number;
    userId: string;
    appSubscriptionPlanId: string;
}

export interface CreateRazorpaySubscriptionOutput {
    razorpaySubscriptionId: string;
    shortUrl: string;
}

export interface CreateRazorpayPlanInput {
    name: string;
    description: string;
    amountRupees: number;
    durationDays: number;
    appPlanId: string;
}

export interface IRazorpaySubscriptionGatewayService {
    getRazorpayCustomer(
        input: EnsureRazorpayCustomerInput,
    ): Promise<Result<{ customerId: string }>>;
    createPlan(
        input: CreateRazorpayPlanInput,
    ): Promise<Result<{ razorpayPlanId: string }>>;
    createSubscription(
        input: CreateRazorpaySubscriptionInput,
    ): Promise<Result<CreateRazorpaySubscriptionOutput>>;
    verifySubscriptionWebhookEvent(
        input: BinaryLike,
        signature: string,
        eventId: string,
    ): Promise<Result<IsubcriptionWebhookEventHandleInputDto>>;
}
