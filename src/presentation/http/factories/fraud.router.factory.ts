import { TYPES } from '@di/types.di';
import { Router } from 'express';
import { Container } from 'inversify';
import { FraudRoutes } from '../routes/fraud/fraud.routes';
import { FraudController } from '../controllers/fraud/fraud.controller';
import { AuthenticateMiddleware } from '../middlewares/authenticate.middleware';
import { AuthorizeMiddleware } from '../middlewares/authorize.middleware';

export class FraudRouterFactory {
    public static fraudRouter(container: Container): Router {
        const controller = container.get<FraudController>(
            TYPES.FraudController,
        );
        const authenticateMiddleware = container.get<AuthenticateMiddleware>(
            TYPES.AuthenticateMiddleware,
        );
        const authorizeMiddleware = container.get<AuthorizeMiddleware>(
            TYPES.AuthorizeMiddleware,
        );
        const routes = new FraudRoutes(
            controller,
            authenticateMiddleware,
            authorizeMiddleware,
        );
        return routes.register();
    }
}
