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
      '/sellers/:id/kyc/approve',
      this._authenticateMiddleware.authenticate,
      this._authorizeMiddleware.authorize([UserRoleType.ADMIN]),
      this._adminController.approveSellerKyc,
    );
    this._router.patch(
      '/sellers/:id/kyc/reject',
      this._authenticateMiddleware.authenticate,
      this._authorizeMiddleware.authorize([UserRoleType.ADMIN]),
      this._adminController.rejectSellerKyc,
    );
    this._router.get(
      '/sellers/:id',
      this._authenticateMiddleware.authenticate,
      this._authorizeMiddleware.authorize([UserRoleType.ADMIN]),
      this._adminController.getSeller,
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

    this._router.get(
      '/category-requests',
      this._authenticateMiddleware.authenticate,
      this._authorizeMiddleware.authorize([UserRoleType.ADMIN]),
      this._adminController.getAllCategoryRequest,
    );

    this._router.get(
      '/auctions',
      this._authenticateMiddleware.authenticate,
      this._authorizeMiddleware.authorize([UserRoleType.ADMIN]),
      this._adminController.getAllAdminAuctions,
    );

    this._router.patch(
      '/auction-categories/:id/approve',
      this._authenticateMiddleware.authenticate,
      this._authorizeMiddleware.authorize([UserRoleType.ADMIN]),
      this._adminController.approveAuctionCategory,
    );

    this._router.patch(
      '/auction-categories/:id/reject',
      this._authenticateMiddleware.authenticate,
      this._authorizeMiddleware.authorize([UserRoleType.ADMIN]),
      this._adminController.rejectAuctionCategory,
    );

    this._router.patch(
      '/auction-categories/:id/status',
      this._authenticateMiddleware.authenticate,
      this._authorizeMiddleware.authorize([UserRoleType.ADMIN]),
      this._adminController.changeAuctionCategoryStatus,
    );

    this._router.get(
      '/auction-categories',
      this._authenticateMiddleware.authenticate,
      this._authorizeMiddleware.authorize([UserRoleType.ADMIN]),
      this._adminController.getAllAdminAuctionCategories,
    );

    this._router.post(
      '/auction-categories',
      this._authenticateMiddleware.authenticate,
      this._authorizeMiddleware.authorize([UserRoleType.ADMIN]),
      this._adminController.createAuctionCategory,
    );

    this._router.put(
      '/auction-categories/:id',
      this._authenticateMiddleware.authenticate,
      this._authorizeMiddleware.authorize([UserRoleType.ADMIN]),
      this._adminController.updateAuctionCategory,
    );

    this._router.get(
      '/kyc/:id/view',
      this._authenticateMiddleware.authenticate,
      this._authorizeMiddleware.authorize([UserRoleType.ADMIN]),
      this._adminController.viewKyc,
    );

    return this._router;
  }
}
