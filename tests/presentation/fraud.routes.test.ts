import { describe, expect, it, vi, beforeEach } from 'vitest';
import express from 'express';
import { FraudRoutes } from '../../src/presentation/http/routes/fraud/fraud.routes';
import { FraudController } from '../../src/presentation/http/controllers/fraud/fraud.controller';
import {
    createMockAuthenticateMiddleware,
    createMockAuthorizeMiddleware,
    mockHandlerResponse,
    sendRouteRequest,
} from './helpers/route-test.helper';

describe('FraudRoutes - Integration (Supertest)', () => {
    let app: express.Express;
    let mockFraudController: FraudController;

    beforeEach(() => {
        vi.clearAllMocks();

        mockFraudController = {
            createReport: vi.fn(),
            getReports: vi.fn(),
            markUnderReview: vi.fn(),
            reviewReport: vi.fn(),
            updateReport: vi.fn(),
            getSuspendedUsers: vi.fn(),
            getSuspensionTimeline: vi.fn(),
        } as unknown as FraudController;

        app = express();
        app.use(express.json());

        const fraudRoutes = new FraudRoutes(
            mockFraudController,
            createMockAuthenticateMiddleware(),
            createMockAuthorizeMiddleware(),
        );
        app.use('/api/v1/fraud', fraudRoutes.register());
    });

    const routeCases = [
        {
            method: 'post' as const,
            path: '/reports',
            handler: 'createReport' as const,
        },
        {
            method: 'get' as const,
            path: '/reports',
            handler: 'getReports' as const,
        },
        {
            method: 'patch' as const,
            path: '/reports/report-1/under-review',
            handler: 'markUnderReview' as const,
        },
        {
            method: 'patch' as const,
            path: '/reports/report-1/review',
            handler: 'reviewReport' as const,
        },
        {
            method: 'patch' as const,
            path: '/reports/report-1',
            handler: 'updateReport' as const,
        },
        {
            method: 'get' as const,
            path: '/suspended-users',
            handler: 'getSuspendedUsers' as const,
        },
        {
            method: 'get' as const,
            path: '/suspended-users/user-1/timeline',
            handler: 'getSuspensionTimeline' as const,
        },
    ];

    it.each(routeCases)(
        'should route $method $path to $handler',
        async ({ method, path, handler }) => {
            const controllerMethod = mockFraudController[handler];
            mockHandlerResponse(controllerMethod);

            const response = await sendRouteRequest(
                app,
                method,
                `/api/v1/fraud${path}`,
            ).send({ reason: 'suspicious activity' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ success: true });
            expect(controllerMethod).toHaveBeenCalledTimes(1);
        },
    );
});
