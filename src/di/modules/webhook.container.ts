import { IRazorpaySubscriptionWebhookHandlerUsecase } from '@application/interfaces/usecases/webhooks/IRazpSubscriptionWebhookhandlerUsecase';
import { RazorpaySubscriptionWebhookHandlerUsecase } from '@application/usecases/webhook/razorpaySubscriptionWebhookHandler.usecase';
import { TYPES } from '@di/types.di';
import { ContainerModule } from 'inversify';

export const webhookContainer = new ContainerModule(({ bind }) => {
    bind<IRazorpaySubscriptionWebhookHandlerUsecase>(
        TYPES.IRazorpaySubscriptionWebhookHandlerUsecase,
    ).to(RazorpaySubscriptionWebhookHandlerUsecase);
});
