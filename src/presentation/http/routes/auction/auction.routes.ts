import { UserRoleType } from '@application/dtos/auth/loginUser.dto';
import { TYPES } from '@di/types.di';
import { AuctionController } from '@presentation/http/controllers/auction/auction.controller';
import { AuthenticateMiddleware } from '@presentation/http/middlewares/authenticate.middleware';
import { AuthorizeMiddleware } from '@presentation/http/middlewares/authorize.middleware';
import { Router } from 'express';
import { inject, injectable } from 'inversify';

@injectable()
export class AuctionRoutes {
  private _router: Router;

  constructor(
    @inject(TYPES.AuthenticateMiddleware)
    private _authenticateMiddleware: AuthenticateMiddleware,
    @inject(TYPES.AuthorizeMiddleware)
    private _authorizeMiddleware: AuthorizeMiddleware,
    @inject(TYPES.AuctionController)
    private _auctionController: AuctionController,
  ) {
    this._router = Router();
  }

  register(): Router {
    this._router.post(
      '/',
      this._authenticateMiddleware.authenticate,
      this._authorizeMiddleware.authorize([UserRoleType.SELLER]),
      this._auctionController.createAuction,
    );

    this._router.get(
      '/categories',
      this._auctionController.getAllAuctionCategories,
    );

    this._router.post(
      '/upload-url',
      this._authenticateMiddleware.authenticate,
      this._authorizeMiddleware.authorize([UserRoleType.SELLER]),
      this._auctionController.generateUploadUrl,
    );

    this._router.post(
      '/:id/bid',
      this._authenticateMiddleware.authenticate,
      this._auctionController.placeBid,
    );

    this._router.put(
      '/:id',
      this._authenticateMiddleware.authenticate,
      this._authorizeMiddleware.authorize([UserRoleType.SELLER]),
      this._auctionController.updateAuction,
    );

    this._router.post(
      '/:id/publish',
      this._authenticateMiddleware.authenticate,
      this._authorizeMiddleware.authorize([UserRoleType.SELLER]),
      this._auctionController.publishAuction,
    );

    this._router.post(
      '/:id/end',
      this._authenticateMiddleware.authenticate,
      this._authorizeMiddleware.authorize([UserRoleType.SELLER]),
      this._auctionController.endAuction,
    );

    return this._router;
  }
}
