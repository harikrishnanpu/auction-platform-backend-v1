import { AuthRoutes } from '../routes/auth/auth.routes';
import { AuthController } from '../controllers/auth/auth.controller';
import { TYPES } from 'di/types.di';
import { Container } from 'inversify';
import { AuthenticateMiddleware } from '../middlewares/authenticate.middleware';
import { AuthorizeMiddleware } from '../middlewares/authorize.middleware';
import { Router } from 'express';

export class AuthRouterFactory {
  public static authRouter(container: Container): Router {
    console.log('is bound: ', container.isBound(TYPES.AuthController));

    console.log('Is boun Class:', container.isBound(AuthController));
    console.log('Is boun symbol:', container.isBound(TYPES.AuthController));

    const authController = container.get<AuthController>(TYPES.AuthController);
    const authenticateMiddleware = container.get<AuthenticateMiddleware>(
      TYPES.AuthenticateMiddleware,
    );
    const authorizeMiddleware = container.get<AuthorizeMiddleware>(
      TYPES.AuthorizeMiddleware,
    );

    const authRoutes = new AuthRoutes(
      authController,
      authenticateMiddleware,
      authorizeMiddleware,
    );

    return authRoutes.register();
  }
}
