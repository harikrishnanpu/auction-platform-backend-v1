import { Result } from '@domain/shared/result';

export interface EnsureRazorpayCustomerInput {
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
    ensureCustomer(
        input: EnsureRazorpayCustomerInput,
    ): Promise<Result<{ customerId: string }>>;
    createPlan(
        input: CreateRazorpayPlanInput,
    ): Promise<Result<{ razorpayPlanId: string }>>;
    createSubscription(
        input: CreateRazorpaySubscriptionInput,
    ): Promise<Result<CreateRazorpaySubscriptionOutput>>;
}
