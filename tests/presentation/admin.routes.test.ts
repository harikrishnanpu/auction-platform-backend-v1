import { describe, expect, it, vi, beforeEach } from 'vitest';
import express from 'express';
import { AdminRoutes } from '../../src/presentation/http/routes/admin/admin.routes';
import { AdminController } from '../../src/presentation/http/controllers/admin/admin.controller';
import {
    createMockAuthenticateMiddleware,
    createMockAuthorizeMiddleware,
    mockHandlerResponse,
    sendRouteRequest,
} from './helpers/route-test.helper';

describe('AdminRoutes - Integration', () => {
    let app: express.Express;
    let mockAdminController: AdminController;

    beforeEach(() => {
        vi.clearAllMocks();

        mockAdminController = {
            getDashboardStats: vi.fn(),
            getAllUsers: vi.fn(),
            getAllSellers: vi.fn(),
            approveSellerKyc: vi.fn(),
            rejectSellerKyc: vi.fn(),
            getSeller: vi.fn(),
            blockUser: vi.fn(),
            getUser: vi.fn(),
            getAllCategoryRequest: vi.fn(),
            getAllAdminAuctions: vi.fn(),
            approveAuctionCategory: vi.fn(),
            rejectAuctionCategory: vi.fn(),
            changeAuctionCategoryStatus: vi.fn(),
            getAllAdminAuctionCategories: vi.fn(),
            createAuctionCategory: vi.fn(),
            updateAuctionCategory: vi.fn(),
            viewKyc: vi.fn(),
            getSystemConfigs: vi.fn(),
            updateSystemConfig: vi.fn(),
            createSubscriptionPlan: vi.fn(),
            getSubscriptionPlans: vi.fn(),
            updateSubscriptionPlanStatus: vi.fn(),
            getSubscriptionFeatures: vi.fn(),
            getSubscribedUsers: vi.fn(),
            updateSubscriptionPlan: vi.fn(),
        } as unknown as AdminController;

        app = express();
        app.use(express.json());

        const adminRoutes = new AdminRoutes(
            mockAdminController,
            createMockAuthenticateMiddleware(),
            createMockAuthorizeMiddleware(),
        );
        app.use('/api/v1/admin', adminRoutes.register());
    });

    const routeCases = [
        {
            method: 'get' as const,
            path: '/stats',
            handler: 'getDashboardStats' as const,
        },
        {
            method: 'get' as const,
            path: '/users',
            handler: 'getAllUsers' as const,
        },
        {
            method: 'get' as const,
            path: '/sellers',
            handler: 'getAllSellers' as const,
        },
        {
            method: 'patch' as const,
            path: '/sellers/seller-1/kyc/approve',
            handler: 'approveSellerKyc' as const,
        },
        {
            method: 'patch' as const,
            path: '/sellers/seller-1/kyc/reject',
            handler: 'rejectSellerKyc' as const,
        },
        {
            method: 'get' as const,
            path: '/sellers/seller-1',
            handler: 'getSeller' as const,
        },
        {
            method: 'patch' as const,
            path: '/users/block/user-1',
            handler: 'blockUser' as const,
        },
        {
            method: 'get' as const,
            path: '/users/user-1',
            handler: 'getUser' as const,
        },
        {
            method: 'get' as const,
            path: '/category-requests',
            handler: 'getAllCategoryRequest' as const,
        },
        {
            method: 'get' as const,
            path: '/auctions',
            handler: 'getAllAdminAuctions' as const,
        },
        {
            method: 'patch' as const,
            path: '/auction-categories/cat-1/approve',
            handler: 'approveAuctionCategory' as const,
        },
        {
            method: 'patch' as const,
            path: '/auction-categories/cat-1/reject',
            handler: 'rejectAuctionCategory' as const,
        },
        {
            method: 'patch' as const,
            path: '/auction-categories/cat-1/status',
            handler: 'changeAuctionCategoryStatus' as const,
        },
        {
            method: 'get' as const,
            path: '/auction-categories',
            handler: 'getAllAdminAuctionCategories' as const,
        },
        {
            method: 'post' as const,
            path: '/auction-categories',
            handler: 'createAuctionCategory' as const,
        },
        {
            method: 'put' as const,
            path: '/auction-categories/cat-1',
            handler: 'updateAuctionCategory' as const,
        },
        {
            method: 'get' as const,
            path: '/kyc/kyc-1/view',
            handler: 'viewKyc' as const,
        },
        {
            method: 'get' as const,
            path: '/system-configs',
            handler: 'getSystemConfigs' as const,
        },
        {
            method: 'put' as const,
            path: '/system-configs',
            handler: 'updateSystemConfig' as const,
        },
        {
            method: 'post' as const,
            path: '/subscriptions/plans',
            handler: 'createSubscriptionPlan' as const,
        },
        {
            method: 'get' as const,
            path: '/subscriptions/plans',
            handler: 'getSubscriptionPlans' as const,
        },
        {
            method: 'patch' as const,
            path: '/subscriptions/plans/plan-1',
            handler: 'updateSubscriptionPlanStatus' as const,
        },
        {
            method: 'get' as const,
            path: '/subscriptions/features',
            handler: 'getSubscriptionFeatures' as const,
        },
        {
            method: 'get' as const,
            path: '/subscriptions/users',
            handler: 'getSubscribedUsers' as const,
        },
        {
            method: 'put' as const,
            path: '/subscriptions/plans/plan-1',
            handler: 'updateSubscriptionPlan' as const,
        },
    ];

    it.each(routeCases)(
        'should route $method $path to $handler',
        async ({ method, path, handler }) => {
            const controllerMethod = mockAdminController[handler];
            mockHandlerResponse(controllerMethod);

            const response = await sendRouteRequest(
                app,
                method,
                `/api/v1/admin${path}`,
            ).send({ status: 'active' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ success: true });
            expect(controllerMethod).toHaveBeenCalledTimes(1);
        },
    );
});
