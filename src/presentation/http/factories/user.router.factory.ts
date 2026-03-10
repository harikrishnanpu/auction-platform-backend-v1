import { Router } from 'express';
import { Container } from 'inversify';
import { UserController } from '../controllers/user/user.controler';
import { TYPES } from '@di/types.di';
import { AuthenticateMiddleware } from '../middlewares/authenticate.middleware';
import { AuthorizeMiddleware } from '../middlewares/authorize.middleware';
import { UserRoutes } from '../routes/user/user.routes';

export class UserRouterFactory {
  public static userRouter(container: Container): Router {
    const userController = container.get<UserController>(TYPES.UserController);
    const authenticateMiddleware = container.get<AuthenticateMiddleware>(
      TYPES.AuthenticateMiddleware,
    );
    const authorizeMiddleware = container.get<AuthorizeMiddleware>(
      TYPES.AuthorizeMiddleware,
    );
    const userRoutes = new UserRoutes(
      userController,
      authenticateMiddleware,
      authorizeMiddleware,
    );
    return userRoutes.register();
  }
}
