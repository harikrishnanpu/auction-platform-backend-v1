import { Result } from '@domain/shared/result';
import { BinaryLike } from 'crypto';

export interface IsubcriptionWebhookEventHandleInputDto {
    event: string;
    subscriptionId: string;
    headers: {
        'x-razorpay-event-id': string;
        'x-razorpay-signature': string;
    };
}

export interface IRazorpaySubscriptionWebhookHandlerUsecase {
    execute(
        input: BinaryLike,
        { signature, eventId }: { signature: string; eventId: string },
    ): Promise<Result<void>>;
}
