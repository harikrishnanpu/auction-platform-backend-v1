import { describe, expect, it, vi, beforeEach } from 'vitest';
import express from 'express';
import { SellerRoutes } from '../../src/presentation/http/routes/seller/seller.routes';
import { SellerController } from '../../src/presentation/http/controllers/seller/seller.controller';
import {
    createMockAuthenticateMiddleware,
    createMockAuthorizeMiddleware,
    mockHandlerResponse,
    sendRouteRequest,
} from './helpers/route-test.helper';

describe('SellerRoutes - Integration (Supertest)', () => {
    let app: express.Express;
    let mockSellerController: SellerController;

    beforeEach(() => {
        vi.clearAllMocks();

        mockSellerController = {
            requestAuctionCategory: vi.fn(),
            getAllSellerAuctionCategory: vi.fn(),
            getSellerDashboardStats: vi.fn(),
            getAllAuctions: vi.fn(),
            getSellerAuctionById: vi.fn(),
            getSellerAuctionPayments: vi.fn(),
        } as unknown as SellerController;

        app = express();
        app.use(express.json());

        const sellerRoutes = new SellerRoutes(
            mockSellerController,
            createMockAuthenticateMiddleware(),
            createMockAuthorizeMiddleware(),
        );
        app.use('/api/v1/seller', sellerRoutes.register());
    });

    const routeCases = [
        {
            method: 'post' as const,
            path: '/auction-category/request',
            handler: 'requestAuctionCategory' as const,
        },
        {
            method: 'get' as const,
            path: '/auction-category-requests',
            handler: 'getAllSellerAuctionCategory' as const,
        },
        {
            method: 'get' as const,
            path: '/dashboard-stats',
            handler: 'getSellerDashboardStats' as const,
        },
        {
            method: 'get' as const,
            path: '/auctions',
            handler: 'getAllAuctions' as const,
        },
        {
            method: 'get' as const,
            path: '/auctions/auction-1',
            handler: 'getSellerAuctionById' as const,
        },
        {
            method: 'get' as const,
            path: '/payments',
            handler: 'getSellerAuctionPayments' as const,
        },
    ];

    it.each(routeCases)(
        'should route $method $path to $handler',
        async ({ method, path, handler }) => {
            const controllerMethod = mockSellerController[handler];
            mockHandlerResponse(controllerMethod);

            const response = await sendRouteRequest(
                app,
                method,
                `/api/v1/seller${path}`,
            ).send({ categoryName: 'Electronics' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ success: true });
            expect(controllerMethod).toHaveBeenCalledTimes(1);
        },
    );
});
