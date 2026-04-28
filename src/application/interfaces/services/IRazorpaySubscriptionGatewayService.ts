import { Result } from '@domain/shared/result';

export interface EnsureRazorpayCustomerInput {
    userId: string;
    name: string;
    email: string;
    phone: string | null;
}

export interface CreateRazorpaySubscriptionGatewayInput {
    razorpayPlanId: string;
    customerId: string;
    userSubscriptionId: string;
    userId: string;
    appSubscriptionPlanId: string;
}

export interface CreateRazorpaySubscriptionGatewayOutput {
    razorpaySubscriptionId: string;
    shortUrl: string;
}

export interface CreateRazorpayPlanGatewayInput {
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
        input: CreateRazorpayPlanGatewayInput,
    ): Promise<Result<{ razorpayPlanId: string }>>;
    createSubscription(
        input: CreateRazorpaySubscriptionGatewayInput,
    ): Promise<Result<CreateRazorpaySubscriptionGatewayOutput>>;
}
