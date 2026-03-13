import { TYPES } from '@di/types.di';
import { Router } from 'express';
import { Container } from 'inversify';
import { AdminRoutes } from '../routes/admin/admin.routes';
import { AdminController } from '../controllers/admin/admin.controller';
import { AuthenticateMiddleware } from '../middlewares/authenticate.middleware';
import { AuthorizeMiddleware } from '../middlewares/authorize.middleware';

export class AdminRouterFactory {
  public static adminRouter(container: Container): Router {
    const adminController = container.get<AdminController>(
      TYPES.AdminController,
    );
    const authenticateMiddleware = container.get<AuthenticateMiddleware>(
      TYPES.AuthenticateMiddleware,
    );
    const authorizeMiddleware = container.get<AuthorizeMiddleware>(
      TYPES.AuthorizeMiddleware,
    );
    const adminRoutes = new AdminRoutes(
      adminController,
      authenticateMiddleware,
      authorizeMiddleware,
    );
    return adminRoutes.register();
  }
}
