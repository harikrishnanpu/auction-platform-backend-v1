import { describe, expect, it, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { WebhookRoutes } from '../../src/presentation/http/routes/webhook/webhook.routes';
import { WebhookController } from '../../src/presentation/http/controllers/webhook/webhook.controller';
import { mockHandlerResponse } from './helpers/route-test.helper';

describe('WebhookRoutes - Integration', () => {
    let app: express.Express;
    let mockWebhookController: WebhookController;

    beforeEach(() => {
        vi.clearAllMocks();

        mockWebhookController = {
            razorpaySubscriptionWebhook: vi.fn(),
        } as unknown as WebhookController;

        app = express();
        app.use(express.json());

        const webhookRoutes = new WebhookRoutes(mockWebhookController);
        app.use('/api/v1/webhooks', webhookRoutes.register());
    });

    it('should route POST /razorpay/subscription to razorpaySubscriptionWebhook', async () => {
        mockHandlerResponse(
            mockWebhookController.razorpaySubscriptionWebhook,
            200,
            {
                received: true,
            },
        );

        const response = await request(app)
            .post('/api/v1/webhooks/razorpay/subscription')
            .send({ event: 'subscription.activated' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ received: true });
        expect(
            mockWebhookController.razorpaySubscriptionWebhook,
        ).toHaveBeenCalledTimes(1);
    });
});
