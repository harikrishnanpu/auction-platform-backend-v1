import { describe, expect, it, vi, beforeEach } from 'vitest';
import express from 'express';
import { AuctionRoutes } from '../../src/presentation/http/routes/auction/auction.routes';
import { AuctionController } from '../../src/presentation/http/controllers/auction/auction.controller';
import {
    createMockAuthenticateMiddleware,
    createMockAuthorizeMiddleware,
    mockHandlerResponse,
    sendRouteRequest,
} from './helpers/route-test.helper';

describe('AuctionRoutes - Integration (Supertest)', () => {
    let app: express.Express;
    let mockAuctionController: AuctionController;

    beforeEach(() => {
        vi.clearAllMocks();

        mockAuctionController = {
            createAuction: vi.fn(),
            getUserHomeAuctionFeed: vi.fn(),
            getBrowseAuctions: vi.fn(),
            getAllAuctionCategories: vi.fn(),
            generateUploadUrl: vi.fn(),
            getAuctionBids: vi.fn(),
            getAuctionById: vi.fn(),
            updateAuction: vi.fn(),
            publishAuction: vi.fn(),
        } as unknown as AuctionController;

        app = express();
        app.use(express.json());

        const auctionRoutes = new AuctionRoutes(
            createMockAuthenticateMiddleware(),
            createMockAuthorizeMiddleware(),
            mockAuctionController,
        );
        app.use('/api/v1/auction', auctionRoutes.register());
    });

    const routeCases = [
        {
            method: 'post' as const,
            path: '/',
            handler: 'createAuction' as const,
        },
        {
            method: 'get' as const,
            path: '/home-feed',
            handler: 'getUserHomeAuctionFeed' as const,
        },
        {
            method: 'get' as const,
            path: '/auctions',
            handler: 'getBrowseAuctions' as const,
        },
        {
            method: 'get' as const,
            path: '/categories',
            handler: 'getAllAuctionCategories' as const,
        },
        {
            method: 'post' as const,
            path: '/upload-url',
            handler: 'generateUploadUrl' as const,
        },
        {
            method: 'get' as const,
            path: '/auction-1/bids',
            handler: 'getAuctionBids' as const,
        },
        {
            method: 'get' as const,
            path: '/auction-1',
            handler: 'getAuctionById' as const,
        },
        {
            method: 'put' as const,
            path: '/auction-1',
            handler: 'updateAuction' as const,
        },
        {
            method: 'post' as const,
            path: '/auction-1/publish',
            handler: 'publishAuction' as const,
        },
    ];

    it.each(routeCases)(
        'should route $method $path to $handler',
        async ({ method, path, handler }) => {
            const controllerMethod = mockAuctionController[handler];
            mockHandlerResponse(controllerMethod);

            const response = await sendRouteRequest(
                app,
                method,
                `/api/v1/auction${path}`,
            ).send({ title: 'Vintage Watch' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ success: true });
            expect(controllerMethod).toHaveBeenCalledTimes(1);
        },
    );
});
