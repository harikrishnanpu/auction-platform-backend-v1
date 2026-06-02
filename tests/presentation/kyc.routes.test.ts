import { describe, expect, it, vi, beforeEach } from 'vitest';
import express from 'express';
import { KycRoutes } from '../../src/presentation/http/routes/kyc/kyc.routes';
import { KycController } from '../../src/presentation/http/controllers/kyc/kyc.controller';
import {
    createMockAuthenticateMiddleware,
    createMockAuthorizeMiddleware,
    mockHandlerResponse,
    sendRouteRequest,
} from './helpers/route-test.helper';

describe('KycRoutes - Integration (Supertest)', () => {
    let app: express.Express;
    let mockKycController: KycController;

    beforeEach(() => {
        vi.clearAllMocks();

        mockKycController = {
            getKycUploadUrl: vi.fn(),
            getKycStatus: vi.fn(),
            updateKyc: vi.fn(),
            submitKyc: vi.fn(),
        } as unknown as KycController;

        app = express();
        app.use(express.json());

        const kycRoutes = new KycRoutes(
            createMockAuthenticateMiddleware(),
            createMockAuthorizeMiddleware(),
            mockKycController,
        );
        app.use('/api/v1/kyc', kycRoutes.register());
    });

    const routeCases = [
        {
            method: 'post' as const,
            path: '/get-kyc-upload-url',
            handler: 'getKycUploadUrl' as const,
        },
        {
            method: 'post' as const,
            path: '/get-kyc-status',
            handler: 'getKycStatus' as const,
        },
        {
            method: 'put' as const,
            path: '/update-kyc',
            handler: 'updateKyc' as const,
        },
        {
            method: 'post' as const,
            path: '/submit-kyc',
            handler: 'submitKyc' as const,
        },
    ];

    it.each(routeCases)(
        'should route $method $path to $handler',
        async ({ method, path, handler }) => {
            const controllerMethod = mockKycController[handler];
            mockHandlerResponse(controllerMethod);

            const response = await sendRouteRequest(
                app,
                method,
                `/api/v1/kyc${path}`,
            ).send({ documentType: 'PAN' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ success: true });
            expect(controllerMethod).toHaveBeenCalledTimes(1);
        },
    );
});
