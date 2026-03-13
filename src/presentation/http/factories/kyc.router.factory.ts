import { Router } from 'express';
import { Container } from 'inversify';
import { KycController } from '../controllers/kyc/kyc.controller';
import { TYPES } from '@di/types.di';
import { AuthenticateMiddleware } from '../middlewares/authenticate.middleware';
import { AuthorizeMiddleware } from '../middlewares/authorize.middleware';
import { KycRoutes } from '../routes/kyc/kyc.routes';

export class KycRouterFactory {
  public static kycRouter(container: Container): Router {
    const kycController = container.get<KycController>(TYPES.KycController);
    const authenticateMiddleware = container.get<AuthenticateMiddleware>(
      TYPES.AuthenticateMiddleware,
    );
    const authorizeMiddleware = container.get<AuthorizeMiddleware>(
      TYPES.AuthorizeMiddleware,
    );

    const kycRoutes = new KycRoutes(
      authenticateMiddleware,
      authorizeMiddleware,
      kycController,
    );
    return kycRoutes.register();
  }
}
