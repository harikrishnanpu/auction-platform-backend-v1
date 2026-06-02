import { vi } from 'vitest';
import request, { Test } from 'supertest';
import express, {
    NextFunction,
    Request,
    RequestHandler,
    Response,
} from 'express';
import { AuthenticateMiddleware } from '../../../src/presentation/http/middlewares/authenticate.middleware';
import { AuthorizeMiddleware } from '../../../src/presentation/http/middlewares/authorize.middleware';

export function createMockAuthenticateMiddleware(): AuthenticateMiddleware {
    return {
        authenticate: vi.fn(
            (_req: Request, _res: Response, next: NextFunction) => next(),
        ),
    } as unknown as AuthenticateMiddleware;
}

export function createMockAuthorizeMiddleware(): AuthorizeMiddleware {
    return {
        authorize: vi.fn(
            () => (_req: Request, _res: Response, next: NextFunction) => next(),
        ),
    } as unknown as AuthorizeMiddleware;
}

export type RouteHttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export function sendRouteRequest(
    app: express.Express,
    method: RouteHttpMethod,
    url: string,
): Test {
    return request(app)[method](url);
}

export function mockHandlerResponse(
    handler: RequestHandler,
    status = 200,
    body: Record<string, unknown> = { success: true },
): void {
    vi.mocked(handler).mockImplementationOnce((_req, res) => {
        res.status(status).json(body);
    });
}
