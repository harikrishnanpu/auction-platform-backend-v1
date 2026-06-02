import { describe, expect, it, vi, beforeEach } from 'vitest';
import express from 'express';
import { UserRoutes } from '../../src/presentation/http/routes/user/user.routes';
import { UserController } from '../../src/presentation/http/controllers/user/user.controler';
import {
    createMockAuthenticateMiddleware,
    createMockAuthorizeMiddleware,
    mockHandlerResponse,
    sendRouteRequest,
} from './helpers/route-test.helper';

describe('UserRoutes - Integration', () => {
    let app: express.Express;
    let mockUserController: UserController;

    beforeEach(() => {
        vi.clearAllMocks();

        mockUserController = {
            getHomeStats: vi.fn(),
            sendProfileChangePasswordOtp: vi.fn(),
            changeProfilePassword: vi.fn(),
            editProfileSendOtp: vi.fn(),
            editProfile: vi.fn(),
            generateAvatarUploadUrl: vi.fn(),
            updateAvatarUrl: vi.fn(),
            getNotifications: vi.fn(),
            streamNotifications: vi.fn(),
            getMyAuctions: vi.fn(),
            getWallet: vi.fn(),
            getSubscriptionPlans: vi.fn(),
            startSubscriptionCheckout: vi.fn(),
        } as unknown as UserController;

        app = express();
        app.use(express.json());

        const userRoutes = new UserRoutes(
            mockUserController,
            createMockAuthenticateMiddleware(),
            createMockAuthorizeMiddleware(),
        );
        app.use('/api/v1/user', userRoutes.register());
    });

    const routeCases = [
        {
            method: 'get' as const,
            path: '/home-stats',
            handler: 'getHomeStats' as const,
        },
        {
            method: 'post' as const,
            path: '/send-profile-change-password-otp',
            handler: 'sendProfileChangePasswordOtp' as const,
        },
        {
            method: 'put' as const,
            path: '/change-profile-password',
            handler: 'changeProfilePassword' as const,
        },
        {
            method: 'post' as const,
            path: '/edit-profile-send-otp',
            handler: 'editProfileSendOtp' as const,
        },
        {
            method: 'put' as const,
            path: '/edit-profile',
            handler: 'editProfile' as const,
        },
        {
            method: 'post' as const,
            path: '/generate-avatar-upload-url',
            handler: 'generateAvatarUploadUrl' as const,
        },
        {
            method: 'put' as const,
            path: '/update-avatar-url',
            handler: 'updateAvatarUrl' as const,
        },
        {
            method: 'get' as const,
            path: '/notifications',
            handler: 'getNotifications' as const,
        },
        {
            method: 'get' as const,
            path: '/notifications/stream',
            handler: 'streamNotifications' as const,
        },
        {
            method: 'get' as const,
            path: '/my-auctions',
            handler: 'getMyAuctions' as const,
        },
        {
            method: 'get' as const,
            path: '/wallet',
            handler: 'getWallet' as const,
        },
        {
            method: 'get' as const,
            path: '/subscription-plans',
            handler: 'getSubscriptionPlans' as const,
        },
        {
            method: 'post' as const,
            path: '/subscriptions/checkout',
            handler: 'startSubscriptionCheckout' as const,
        },
    ];

    it.each(routeCases)(
        'should route $method $path to $handler',
        async ({ method, path, handler }) => {
            const controllerMethod = mockUserController[handler];
            mockHandlerResponse(controllerMethod);

            const response = await sendRouteRequest(
                app,
                method,
                `/api/v1/user${path}`,
            ).send({ name: 'Jane Doe' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ success: true });
            expect(controllerMethod).toHaveBeenCalledTimes(1);
        },
    );
});
