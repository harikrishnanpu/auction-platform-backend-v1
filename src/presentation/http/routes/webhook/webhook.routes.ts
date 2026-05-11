import { WebhookController } from '@presentation/http/controllers/webhook/webhook.controller';
import { Router } from 'express';

export class WebhookRoutes {
    private _router: Router;

    constructor(private readonly _webhookController: WebhookController) {
        this._router = Router();
    }

    register(): Router {
        this._router.post(
            '/razorpay/subscription',
            this._webhookController.razorpaySubscriptionWebhook,
        );

        return this._router;
    }
}
