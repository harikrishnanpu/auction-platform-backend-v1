import { describe, expect, it, vi, beforeEach } from 'vitest';
import express from 'express';
import { WalletRoutes } from '../../src/presentation/http/routes/wallet/wallet.routes';
import { WalletController } from '../../src/presentation/http/controllers/wallet/wallet.controller';
import {
    createMockAuthenticateMiddleware,
    createMockAuthorizeMiddleware,
    mockHandlerResponse,
    sendRouteRequest,
} from './helpers/route-test.helper';

describe('WalletRoutes - Integration', () => {
    let app: express.Express;
    let mockWalletController: WalletController;

    beforeEach(() => {
        vi.clearAllMocks();

        mockWalletController = {
            getWallet: vi.fn(),
            creditWallet: vi.fn(),
            debitWallet: vi.fn(),
            createTopupOrder: vi.fn(),
            verifyTopup: vi.fn(),
        } as unknown as WalletController;

        app = express();
        app.use(express.json());

        const walletRoutes = new WalletRoutes(
            mockWalletController,
            createMockAuthenticateMiddleware(),
            createMockAuthorizeMiddleware(),
        );
        app.use('/api/v1/wallet', walletRoutes.register());
    });

    const routeCases = [
        { method: 'get' as const, path: '/', handler: 'getWallet' as const },
        {
            method: 'post' as const,
            path: '/credit',
            handler: 'creditWallet' as const,
        },
        {
            method: 'post' as const,
            path: '/debit',
            handler: 'debitWallet' as const,
        },
        {
            method: 'post' as const,
            path: '/topup/create-order',
            handler: 'createTopupOrder' as const,
        },
        {
            method: 'post' as const,
            path: '/topup/verify',
            handler: 'verifyTopup' as const,
        },
    ];

    it.each(routeCases)(
        'should route $method $path to $handler',
        async ({ method, path, handler }) => {
            const controllerMethod = mockWalletController[handler];
            mockHandlerResponse(controllerMethod);

            const response = await sendRouteRequest(
                app,
                method,
                `/api/v1/wallet${path}`,
            ).send({ amount: 100 });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ success: true });
            expect(controllerMethod).toHaveBeenCalledTimes(1);
        },
    );
});
