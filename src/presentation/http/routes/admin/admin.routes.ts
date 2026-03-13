import { UserRoleType } from '@application/dtos/auth/loginUser.dto';
import { TYPES } from '@di/types.di';
import { AdminController } from '@presentation/http/controllers/admin/admin.controller';
import { AuthenticateMiddleware } from '@presentation/http/middlewares/authenticate.middleware';
import { AuthorizeMiddleware } from '@presentation/http/middlewares/authorize.middleware';
import { Router } from 'express';
import { inject } from 'inversify';

export class AdminRoutes {
  private _router: Router;

  constructor(
    @inject(TYPES.AdminController)
    private readonly _adminController: AdminController,
    @inject(TYPES.AuthenticateMiddleware)
    private readonly _authenticateMiddleware: AuthenticateMiddleware,
    @inject(TYPES.AuthorizeMiddleware)
    private readonly _authorizeMiddleware: AuthorizeMiddleware,
  ) {
    this._router = Router();
  }

  register(): Router {
    this._router.get(
      '/users',
      this._authenticateMiddleware.authenticate,
      this._authorizeMiddleware.authorize([UserRoleType.ADMIN]),
      this._adminController.getAllUsers,
    );
    this._router.get(
      '/sellers',
      this._authenticateMiddleware.authenticate,
      this._authorizeMiddleware.authorize([UserRoleType.ADMIN]),
      this._adminController.getAllSellers,
    );
    this._router.patch(
      '/users/block/:id',
      this._authenticateMiddleware.authenticate,
      this._authorizeMiddleware.authorize([UserRoleType.ADMIN]),
      this._adminController.blockUser,
    );
    this._router.get(
      '/users/:id',
      this._authenticateMiddleware.authenticate,
      this._authorizeMiddleware.authorize([UserRoleType.ADMIN]),
      this._adminController.getUser,
    );
    return this._router;
  }
}
