import { UserRoleType } from '@application/dtos/auth/loginUser.dto';
import { TYPES } from '@di/types.di';
import { KycController } from '@presentation/http/controllers/kyc/kyc.controller';
import { AuthenticateMiddleware } from '@presentation/http/middlewares/authenticate.middleware';
import { AuthorizeMiddleware } from '@presentation/http/middlewares/authorize.middleware';
import { Router } from 'express';
import { inject, injectable } from 'inversify';

@injectable()
export class KycRoutes {
  private _router: Router;

  constructor(
    @inject(TYPES.AuthenticateMiddleware)
    private _authenticateMiddleware: AuthenticateMiddleware,
    @inject(TYPES.AuthorizeMiddleware)
    private _authorizeMiddleware: AuthorizeMiddleware,
    @inject(TYPES.KycController)
    private _kycController: KycController,
  ) {
    this._router = Router();
  }

  register(): Router {
    this._router.post(
      '/get-kyc-upload-url',
      this._authenticateMiddleware.authenticate,
      this._authorizeMiddleware.authorize([UserRoleType.USER]),
      this._kycController.getKycUploadUrl,
    );

    this._router.post(
      '/get-kyc-status',
      this._authenticateMiddleware.authenticate,
      this._authorizeMiddleware.authorize([UserRoleType.USER]),
      this._kycController.getKycStatus,
    );

    this._router.put(
      '/update-kyc',
      this._authenticateMiddleware.authenticate,
      this._authorizeMiddleware.authorize([UserRoleType.USER]),
      this._kycController.updateKyc,
    );

    this._router.post(
      '/submit-kyc',
      this._authenticateMiddleware.authenticate,
      this._authorizeMiddleware.authorize([UserRoleType.USER]),
      this._kycController.submitKyc,
    );

    return this._router;
  }
}
