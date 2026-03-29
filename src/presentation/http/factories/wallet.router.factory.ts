import { Router } from 'express';
import { Container } from 'inversify';
import { WalletController } from '../controllers/wallet/wallet.controller';
import { TYPES } from '@di/types.di';
import { WalletRoutes } from '../routes/wallet/wallet.routes';
import { AuthenticateMiddleware } from '../middlewares/authenticate.middleware';
import { AuthorizeMiddleware } from '../middlewares/authorize.middleware';

export class WalletRouterFactory {
    public static walletRouter(container: Container): Router {
        const walletController = container.get<WalletController>(
            TYPES.WalletController,
        );
        const authenticateMiddleware = container.get<AuthenticateMiddleware>(
            TYPES.AuthenticateMiddleware,
        );
        const authorizeMiddleware = container.get<AuthorizeMiddleware>(
            TYPES.AuthorizeMiddleware,
        );
        const walletRoutes = new WalletRoutes(
            walletController,
            authenticateMiddleware,
            authorizeMiddleware,
        );
        return walletRoutes.register();
    }
}
