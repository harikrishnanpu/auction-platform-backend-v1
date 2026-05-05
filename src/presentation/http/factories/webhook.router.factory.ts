import { TYPES } from '@di/types.di';
import { Container } from 'inversify';
import { Router } from 'express';
import { WebhookController } from '../controllers/webhook/webhook.controller';
import { WebhookRoutes } from '../routes/webhook/webhook.routes';

export class WebhookRouterFactory {
    public static webhookRouter(container: Container): Router {
        const webhookController = container.get<WebhookController>(
            TYPES.WebhookController,
        );

        const webhookRoutes = new WebhookRoutes(webhookController);
        return webhookRoutes.register();
    }
}
