import {
    CreateOrderInput,
    CreateOrderOutput,
    IPaymentGatewayService,
    VerifyPaymentInput,
    VerifyPaymentOutput,
} from '@application/interfaces/services/IPaymentGatewayService';
import { Result } from '@domain/shared/result';
import { createHmac } from 'crypto';
import { injectable } from 'inversify';
import Razorpay from 'razorpay';

@injectable()
export class RazorpayGatewayService implements IPaymentGatewayService {
    private readonly _razorpay: Razorpay;
    private readonly _keyId: string;
    private readonly _keySecret: string;

    constructor() {
        this._keyId = process.env.RAZORPAY_KEY_ID ?? '';
        this._keySecret = process.env.RAZORPAY_KEY_SECRET ?? '';

        if (!this._keyId || !this._keySecret) {
            throw new Error('Razorpay keys are not configured');
        }

        this._razorpay = new Razorpay({
            key_id: this._keyId,
            key_secret: this._keySecret,
        });
    }

    async createOrder(
        input: CreateOrderInput,
    ): Promise<Result<CreateOrderOutput>> {
        if (input.amount <= 0) {
            return Result.fail('Amount must be greater than 0');
        }

        const amountRupees = input.amount;
        const amountInPaise = Math.round(amountRupees * 100);

        const order = await this._razorpay.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            notes: {
                userId: input.userId,
                amount: amountRupees.toString(),
                paymentId: input.paymentId ?? '',
            },
        });

        return Result.ok({
            orderId: order.id,
            amountInPaise: Number(order.amount),
            currency: order.currency,
            gatewayKey: this._keyId,
        });
    }

    async verifyPayment(
        input: VerifyPaymentInput,
    ): Promise<Result<VerifyPaymentOutput>> {
        const generatedSignature = createHmac('sha256', this._keySecret)
            .update(`${input.orderId}|${input.paymentId}`)
            .digest('hex');

        if (generatedSignature !== input.signature) {
            return Result.fail('Invalid payment signature');
        }

        const order = await this._razorpay.orders.fetch(input.orderId);
        const orderUserId = order.notes?.userId;
        const orderPaymentId = order.notes?.paymentId;
        const amount = Number(order.notes?.amount ?? 0);

        if (!orderUserId || orderUserId !== input.userId) {
            return Result.fail('Invalid payment order');
        }

        if (amount <= 0) {
            return Result.fail('Invalid payment amount');
        }

        if (
            input.expectedPaymentId &&
            orderPaymentId !== input.expectedPaymentId
        ) {
            return Result.fail('Invalid payment reference');
        }

        return Result.ok({ amount });
    }
}
