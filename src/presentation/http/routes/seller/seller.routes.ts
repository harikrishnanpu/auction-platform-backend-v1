import { UserRoleType } from '@application/dtos/auth/loginUser.dto';
import { TYPES } from '@di/types.di';
import { SellerController } from '@presentation/http/controllers/seller/seller.controller';
import { AuthenticateMiddleware } from '@presentation/http/middlewares/authenticate.middleware';
import { AuthorizeMiddleware } from '@presentation/http/middlewares/authorize.middleware';
import { Router } from 'express';
import { inject, injectable } from 'inversify';

@injectable()
export class SellerRoutes {
  private _router: Router;
  constructor(
    @inject(TYPES.SellerController)
    private readonly _sellerController: SellerController,
    @inject(TYPES.AuthenticateMiddleware)
    private readonly _authenticateMiddleware: AuthenticateMiddleware,
    @inject(TYPES.AuthorizeMiddleware)
    private readonly _authorizeMiddleware: AuthorizeMiddleware,
  ) {
    this._router = Router();
  }

  register(): Router {
    this._router.post(
      '/auction-category/request',
      this._authenticateMiddleware.authenticate,
      this._authorizeMiddleware.authorize([UserRoleType.SELLER]),
      this._sellerController.requestAuctionCategory,
    );

    this._router.get(
      '/auction-category-requests',
      this._authenticateMiddleware.authenticate,
      this._authorizeMiddleware.authorize([UserRoleType.SELLER]),
      this._sellerController.getAllSellerAuctionCategory,
    );

    this._router.get(
      '/auctions',
      this._authenticateMiddleware.authenticate,
      this._authorizeMiddleware.authorize([UserRoleType.SELLER]),
      this._sellerController.getAllAuctions,
    );

    this._router.get(
      '/auctions/:id',
      this._authenticateMiddleware.authenticate,
      this._authorizeMiddleware.authorize([UserRoleType.SELLER]),
      this._sellerController.getSellerAuctionById,
    );

    return this._router;
  }
}
