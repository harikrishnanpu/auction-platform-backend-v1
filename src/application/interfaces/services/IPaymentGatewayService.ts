import { Result } from '@domain/shared/result';

export interface CreateOrderInput {
    userId: string;
    amount: number;
    referenceId: string;
}

export interface CreateOrderOutput {
    orderId: string;
    amountInPaise: number;
    currency: string;
    gatewayKey: string;
}

export interface VerifyPaymentInput {
    userId: string;
    orderId: string;
    paymentId: string;
    signature: string;
    referenceId: string;
}

export interface VerifyPaymentOutput {
    amount: number;
}

export interface IPaymentGatewayService {
    createOrder(input: CreateOrderInput): Promise<Result<CreateOrderOutput>>;
    verifyPayment(
        input: VerifyPaymentInput,
    ): Promise<Result<VerifyPaymentOutput>>;
}
