import { Router } from 'express';
import { Container } from 'inversify';
import { WalletController } from '../controllers/wallet/wallet.controller';
import { TYPES } from '@di/types.di';
import { WalletRoutes } from '../routes/wallet/wallet.routes';

export class WalletRouterFactory {
    public static walletRouter(container: Container): Router {
        const walletController = container.get<WalletController>(
            TYPES.WalletController,
        );
        const walletRoutes = new WalletRoutes(walletController);
        return walletRoutes.register();
    }
}
