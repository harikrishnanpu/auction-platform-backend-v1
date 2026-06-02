import { describe, expect, it, vi, beforeEach } from 'vitest';
import express from 'express';
import { PaymentsRoutes } from '../../src/presentation/http/routes/payments/payments.routes';
import { PaymentsController } from '../../src/presentation/http/controllers/payments/payments.controller';
import {
    createMockAuthenticateMiddleware,
    createMockAuthorizeMiddleware,
    mockHandlerResponse,
    sendRouteRequest,
} from './helpers/route-test.helper';

describe('PaymentsRoutes - Integration (Supertest)', () => {
    let app: express.Express;
    let mockPaymentsController: PaymentsController;

    beforeEach(() => {
        vi.clearAllMocks();

        mockPaymentsController = {
            getUserPayments: vi.fn(),
            createPaymentOrder: vi.fn(),
            verifyPayment: vi.fn(),
            declinePayment: vi.fn(),
        } as unknown as PaymentsController;

        app = express();
        app.use(express.json());

        const paymentsRoutes = new PaymentsRoutes(
            mockPaymentsController,
            createMockAuthenticateMiddleware(),
            createMockAuthorizeMiddleware(),
        );
        app.use('/api/v1/payments', paymentsRoutes.register());
    });

    const routeCases = [
        {
            method: 'get' as const,
            path: '/',
            handler: 'getUserPayments' as const,
        },
        {
            method: 'post' as const,
            path: '/create-order',
            handler: 'createPaymentOrder' as const,
        },
        {
            method: 'post' as const,
            path: '/verify',
            handler: 'verifyPayment' as const,
        },
        {
            method: 'post' as const,
            path: '/decline',
            handler: 'declinePayment' as const,
        },
    ];

    it.each(routeCases)(
        'should route $method $path to $handler',
        async ({ method, path, handler }) => {
            const controllerMethod = mockPaymentsController[handler];
            mockHandlerResponse(controllerMethod);

            const response = await sendRouteRequest(
                app,
                method,
                `/api/v1/payments${path}`,
            ).send({ orderId: 'order-1' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ success: true });
            expect(controllerMethod).toHaveBeenCalledTimes(1);
        },
    );
});
