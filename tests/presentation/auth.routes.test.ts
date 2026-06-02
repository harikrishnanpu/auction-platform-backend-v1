import { describe, expect, it, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express, { NextFunction, Request, Response } from 'express';
import { AuthRoutes } from '../../src/presentation/http/routes/auth/auth.routes';
import { AuthController } from '../../src/presentation/http/controllers/auth/auth.controller';
import { AuthenticateMiddleware } from '../../src/presentation/http/middlewares/authenticate.middleware';
import { AuthorizeMiddleware } from '../../src/presentation/http/middlewares/authorize.middleware';
import {
    mockHandlerResponse,
    sendRouteRequest,
} from './helpers/route-test.helper';

describe('AuthRoutes - Integration (Supertest)', () => {
    let app: express.Express;
    let mockAuthController: AuthController;
    let mockAuthenticateMiddleware: AuthenticateMiddleware;
    let mockAuthorizeMiddleware: AuthorizeMiddleware;

    beforeEach(() => {
        vi.clearAllMocks();

        mockAuthController = {
            register: vi.fn(),
            sendVerificationCode: vi.fn(),
            verifyCredentials: vi.fn(),
            login: vi.fn(),
            getUser: vi.fn(),
            googleAuth: vi.fn(),
            googleAuthCallback: vi.fn(),
            completeProfile: vi.fn(),
            forgotPassword: vi.fn(),
            changePassword: vi.fn(),
        } as unknown as AuthController;

        mockAuthenticateMiddleware = {
            authenticate: vi.fn(
                (_req: Request, _res: Response, next: NextFunction) => next(),
            ),
        } as unknown as AuthenticateMiddleware;

        mockAuthorizeMiddleware = {
            authorize: vi.fn(
                () => (_req: Request, _res: Response, next: NextFunction) =>
                    next(),
            ),
        } as unknown as AuthorizeMiddleware;

        app = express();
        app.use(express.json());

        const authRoutes = new AuthRoutes(
            mockAuthController,
            mockAuthenticateMiddleware,
            mockAuthorizeMiddleware,
        );

        app.use('/api/v1/auth', authRoutes.register());
    });

    const routeCases = [
        {
            method: 'post' as const,
            path: '/register',
            handler: 'register' as const,
        },
        {
            method: 'post' as const,
            path: '/send-verification-code',
            handler: 'sendVerificationCode' as const,
        },
        {
            method: 'post' as const,
            path: '/verify-credentials',
            handler: 'verifyCredentials' as const,
        },
        { method: 'post' as const, path: '/login', handler: 'login' as const },
        { method: 'get' as const, path: '/me', handler: 'getUser' as const },
        {
            method: 'get' as const,
            path: '/google',
            handler: 'googleAuth' as const,
        },
        {
            method: 'get' as const,
            path: '/google/callback',
            handler: 'googleAuthCallback' as const,
        },
        {
            method: 'post' as const,
            path: '/complete-profile',
            handler: 'completeProfile' as const,
        },
        {
            method: 'post' as const,
            path: '/forgot-password',
            handler: 'forgotPassword' as const,
        },
        {
            method: 'post' as const,
            path: '/change-password',
            handler: 'changePassword' as const,
        },
    ];

    it.each(routeCases)(
        'should route $method $path to $handler',
        async ({ method, path, handler }) => {
            const controllerMethod = mockAuthController[handler];
            mockHandlerResponse(controllerMethod);

            const response = await sendRouteRequest(
                app,
                method,
                `/api/v1/auth${path}`,
            ).send({
                email: 'john.doe@example.com',
                password: 'Password@123',
            });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ success: true });
            expect(controllerMethod).toHaveBeenCalledTimes(1);
        },
    );

    it('should return 400 when login authentication fails due to invalid credentials', async () => {
        const failurePayload = {
            success: false,
            error: 'Invalid email or password',
        };

        mockHandlerResponse(mockAuthController.login, 400, failurePayload);

        const response = await request(app).post('/api/v1/auth/login').send({
            email: 'john.doe@example.com',
            password: 'WrongPassword@123',
        });

        expect(response.status).toBe(400);
        expect(response.body).toEqual(failurePayload);
        expect(mockAuthController.login).toHaveBeenCalledTimes(1);
    });

    it('should successfully login and return a 200 response with tokens and user details', async () => {
        const successPayload = {
            success: true,
            message: 'Logged in successfully',
            data: {
                accessToken: 'mock-access-token',
                refreshToken: 'mock-refresh-token',
                user: {
                    id: 'user-789',
                    name: 'John Doe',
                    email: 'john.doe@example.com',
                },
            },
        };

        vi.mocked(mockAuthController.login).mockImplementationOnce(
            (_req: Request, res: Response) => {
                res.status(200).json(successPayload);
            },
        );

        const response = await request(app).post('/api/v1/auth/login').send({
            email: 'john.doe@example.com',
            password: 'Password@123',
        });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(successPayload);
        expect(mockAuthController.login).toHaveBeenCalledTimes(1);
    });
});
