import { TYPES } from '@di/types.di';
import { WalletController } from '@presentation/http/controllers/wallet/wallet.controller';
import { Router } from 'express';
import { inject, injectable } from 'inversify';

@injectable()
export class WalletRoutes {
    private _router: Router;

    constructor(
        @inject(TYPES.WalletController)
        private readonly _walletController: WalletController,
    ) {
        this._router = Router();
    }

    register(): Router {
        this._router.get('/', this._walletController.getWallet);
        this._router.post('/credit', this._walletController.creditWallet);
        return this._router;
    }
}
