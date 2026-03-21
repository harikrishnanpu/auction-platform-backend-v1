import { Router } from 'express';
import { Container } from 'inversify';
import { SellerController } from '../controllers/seller/seller.controller';
import { AuthenticateMiddleware } from '../middlewares/authenticate.middleware';
import { AuthorizeMiddleware } from '../middlewares/authorize.middleware';
import { SellerRoutes } from '../routes/seller/seller.routes';
import { TYPES } from '@di/types.di';

export class SellerRouterFactory {
  public static sellerRouter(container: Container): Router {
    const sellerController = container.get<SellerController>(
      TYPES.SellerController,
    );
    const authenticateMiddleware = container.get<AuthenticateMiddleware>(
      TYPES.AuthenticateMiddleware,
    );
    const authorizeMiddleware = container.get<AuthorizeMiddleware>(
      TYPES.AuthorizeMiddleware,
    );
    const sellerRoutes = new SellerRoutes(
      sellerController,
      authenticateMiddleware,
      authorizeMiddleware,
    );

    return sellerRoutes.register();
  }
}
