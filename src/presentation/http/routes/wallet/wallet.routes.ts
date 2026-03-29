import { TYPES } from '@di/types.di';
import { UserRoleType } from '@application/dtos/auth/loginUser.dto';
import { WalletController } from '@presentation/http/controllers/wallet/wallet.controller';
import { AuthenticateMiddleware } from '@presentation/http/middlewares/authenticate.middleware';
import { AuthorizeMiddleware } from '@presentation/http/middlewares/authorize.middleware';
import { Router } from 'express';
import { inject, injectable } from 'inversify';

@injectable()
export class WalletRoutes {
    private _router: Router;

    constructor(
        @inject(TYPES.WalletController)
        private readonly _walletController: WalletController,
        @inject(TYPES.AuthenticateMiddleware)
        private readonly _authenticateMiddleware: AuthenticateMiddleware,
        @inject(TYPES.AuthorizeMiddleware)
        private readonly _authorizeMiddleware: AuthorizeMiddleware,
    ) {
        this._router = Router();
    }

    register(): Router {
        this._router.use(this._authenticateMiddleware.authenticate);
        this._router.use(
            this._authorizeMiddleware.authorize([UserRoleType.USER]),
        );

        this._router.get('/', this._walletController.getWallet);
        this._router.post('/credit', this._walletController.creditWallet);
        this._router.post('/debit', this._walletController.debitWallet);
        this._router.post(
            '/topup/create-order',
            this._walletController.createTopupOrder,
        );
        this._router.post('/topup/verify', this._walletController.verifyTopup);
        return this._router;
    }
}
