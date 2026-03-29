import { TYPES } from '@di/types.di';
import { Container } from 'inversify';
import { Router } from 'express';
import { PaymentsController } from '../controllers/payments/payments.controller';
import { AuthenticateMiddleware } from '../middlewares/authenticate.middleware';
import { AuthorizeMiddleware } from '../middlewares/authorize.middleware';
import { PaymentsRoutes } from '../routes/payments/payments.routes';

export class PaymentsRouterFactory {
    public static paymentsRouter(container: Container): Router {
        const paymentsController = container.get<PaymentsController>(
            TYPES.PaymentsController,
        );
        const authenticateMiddleware = container.get<AuthenticateMiddleware>(
            TYPES.AuthenticateMiddleware,
        );
        const authorizeMiddleware = container.get<AuthorizeMiddleware>(
            TYPES.AuthorizeMiddleware,
        );

        const paymentsRoutes = new PaymentsRoutes(
            paymentsController,
            authenticateMiddleware,
            authorizeMiddleware,
        );

        return paymentsRoutes.register();
    }
}
